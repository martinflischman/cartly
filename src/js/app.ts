import { ref, push, onValue, remove, update } from 'firebase/database';
import { database, auth } from './config/firebase';
import { Auth } from './components/Auth';
import { onAuthStateChanged } from 'firebase/auth';

interface ShoppingItem {
  id: string;
  value: string;
  completed: boolean;
  createdAt: number;
  userId: string;
}

class ShoppingCart {
  private inputField: HTMLInputElement;
  private addButton: HTMLButtonElement;
  private shoppingList: HTMLUListElement;
  private databaseRef = ref(database, "shoppingList");
  private loadingState = false;
  private toastContainer: HTMLDivElement = document.createElement('div');
  private auth: Auth;

  constructor() {
    this.inputField = document.getElementById("input-field") as HTMLInputElement;
    this.addButton = document.getElementById("add-button") as HTMLButtonElement;
    this.shoppingList = document.getElementById("shopping-list") as HTMLUListElement;
    this.createToastContainer();
    this.registerServiceWorker();
    
    // Initialize authentication
    this.auth = new Auth();
    // Listen for auth state changes and re-render app
    this.setupUserMenu();
    onAuthStateChanged(auth, (user) => {
      const mainContainer = document.querySelector('.container') as HTMLElement;
      if (mainContainer) {
        mainContainer.style.display = user ? '' : 'none';
      }
      if (user) {
        this.initializeApp();
      } else {
        // Clear UI on logout
        this.clearShoppingList();
        this.clearInputField();
      }
      this.updateUserMenu();
    });
  }

  private createToastContainer(): void {
    this.toastContainer.className = 'fixed bottom-4 left-1/2 -translate-x-1/2 z-50';
    document.body.appendChild(this.toastContainer);
  }

  private async registerServiceWorker(): Promise<void> {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('ServiceWorker registration successful');
      } catch (error) {
        console.error('ServiceWorker registration failed:', error);
      }
    }
  }

  private initializeApp(): void {
    this.initializeEventListeners();
    this.initializeDatabaseListener();
  }

  private initializeEventListeners(): void {
    this.addButton.addEventListener("click", () => this.handleAddItem());
    this.inputField.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        this.handleAddItem();
      }
    });

    this.inputField.addEventListener("input", () => {
      this.inputField.value = this.inputField.value.trim();
    });
  }

  private async handleAddItem(): Promise<void> {
    if (this.loadingState) return;

    const inputValue = this.inputField.value.trim();
    if (!inputValue) {
      this.showToast("Please enter an item", "error");
      return;
    }

    const user = this.auth.getCurrentUser();
    if (!user) {
      this.showToast("Please sign in to add items", "error");
      return;
    }

    try {
      this.setLoading(true);
      await push(this.databaseRef, {
        value: inputValue,
        completed: false,
        createdAt: Date.now(),
        userId: user.uid
      });
      this.clearInputField();
      this.showToast("Item added successfully", "success");
    } catch (error) {
      this.showToast("Failed to add item", "error");
      console.error("Error adding item:", error);
    } finally {
      this.setLoading(false);
    }
  }

  private initializeDatabaseListener(): void {
    onValue(this.databaseRef, (snapshot) => {
      const data = snapshot.val();
      console.log('Database snapshot for rendering:', data);
      if (snapshot.exists()) {
        const items = Object.entries(data) as [string, any][];
        this.renderShoppingList(items); // Render all items for debugging
      } else {
        this.renderEmptyState();
        console.warn('No items found in database or database not connected.');
      }
    });
  }

  private renderShoppingList(items: [string, any][]): void {
    this.clearShoppingList();
    // Remove any previous debug message
    const prevDebug = document.getElementById('debug-list-msg');
    if (prevDebug) prevDebug.remove();
    // Add visible debug message
    const debugMsg = document.createElement('div');
    debugMsg.id = 'debug-list-msg';
    debugMsg.style.color = '#B3261E';
    debugMsg.style.fontSize = '0.9em';
    debugMsg.style.marginBottom = '0.5em';
    debugMsg.textContent = `Debug: Rendering ${items.length} item(s): ` + items.map(([id, item]) => item.value).join(', ');
    this.shoppingList.parentElement?.insertBefore(debugMsg, this.shoppingList);
    // Sort items by creation date
    items.sort((a, b) => b[1].createdAt - a[1].createdAt);
    if (items.length === 0) {
      this.renderEmptyState();
      return;
    }
    items.forEach(([id, item]) => {
      const li = document.createElement("li");
      li.className = "group relative";
      const itemContent = document.createElement("div");
      itemContent.className = `flex items-center justify-between p-3 rounded-lg transition-all duration-200 ${
        item.completed 
          ? 'bg-green-50 text-gray-500 line-through' 
          : 'bg-surface-light hover:bg-surface-dark'
      }`;
      const itemLeft = document.createElement("div");
      itemLeft.className = "flex items-center space-x-3 flex-grow";
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.className = "w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500";
      checkbox.checked = item.completed;
      checkbox.addEventListener("change", () => this.handleToggleComplete(id, !item.completed));
      const itemText = document.createElement("span");
      itemText.textContent = item.value;
      itemText.className = "flex-grow";
      itemLeft.appendChild(checkbox);
      itemLeft.appendChild(itemText);
      const itemActions = document.createElement("div");
      itemActions.className = "flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200";
      const deleteButton = document.createElement("button");
      deleteButton.innerHTML = '<span class="material-icons text-red-500 hover:text-red-700">delete</span>';
      deleteButton.className = "p-1 rounded-full hover:bg-red-50 transition-colors duration-200";
      deleteButton.setAttribute("aria-label", `Delete ${item.value}`);
      deleteButton.addEventListener("click", (e) => {
        e.stopPropagation();
        this.handleRemoveItem(id);
      });
      itemActions.appendChild(deleteButton);
      itemContent.appendChild(itemLeft);
      itemContent.appendChild(itemActions);
      li.appendChild(itemContent);
      this.shoppingList.appendChild(li);
    });
  }

  private renderEmptyState(): void {
    this.clearShoppingList();
    const emptyMessage = document.createElement("p");
    emptyMessage.textContent = "Your cart is empty";
    emptyMessage.className = "empty-cart";
    this.shoppingList.appendChild(emptyMessage);
  }

  private async handleToggleComplete(id: string, completed: boolean): Promise<void> {
    if (this.loadingState) return;

    try {
      this.setLoading(true);
      const itemRef = ref(database, `shoppingList/${id}`);
      await update(itemRef, { completed });
      this.showToast(
        completed ? "Item marked as completed" : "Item marked as incomplete",
        "success"
      );
    } catch (error) {
      this.showToast("Failed to update item", "error");
      console.error("Error updating item:", error);
    } finally {
      this.setLoading(false);
    }
  }

  private async handleRemoveItem(id: string): Promise<void> {
    if (this.loadingState) return;

    if (!confirm("Are you sure you want to remove this item?")) return;

    try {
      this.setLoading(true);
      const itemRef = ref(database, `shoppingList/${id}`);
      await remove(itemRef);
      this.showToast("Item removed successfully", "success");
    } catch (error) {
      this.showToast("Failed to remove item", "error");
      console.error("Error removing item:", error);
    } finally {
      this.setLoading(false);
    }
  }

  private clearShoppingList(): void {
    this.shoppingList.innerHTML = "";
  }

  private clearInputField(): void {
    this.inputField.value = "";
  }

  private setLoading(isLoading: boolean): void {
    this.loadingState = isLoading;
    this.addButton.disabled = isLoading;
    this.inputField.disabled = isLoading;
    if (isLoading) {
      this.addButton.innerHTML = `<span class="flex items-center justify-center gap-2"><span>Loading</span><span class="loading-dots"><span class="dot">.</span><span class="dot">.</span><span class="dot">.</span></span></span>`;
    } else {
      this.addButton.innerHTML = `<span class="material-icons mr-2">add_shopping_cart</span>Add to Cartly`;
    }
    this.addButton.className = isLoading 
      ? "add-button opacity-75 cursor-not-allowed"
      : "add-button";
  }

  private showToast(message: string, type: 'success' | 'error'): void {
    const toast = document.createElement('div');
    toast.className = `toast ${
      type === 'success' ? 'bg-green-500' : 'bg-red-500'
    } text-white`;
    toast.textContent = message;

    this.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.transform = 'translateY(100%)';
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  private setupUserMenu(): void {
    const userMenuBtn = document.getElementById('user-menu-btn');
    const userMenuDropdown = document.getElementById('user-menu-dropdown');
    const userAvatar = document.getElementById('user-avatar');
    if (!userMenuBtn || !userMenuDropdown || !userAvatar) return;
    userMenuBtn.onclick = (e) => {
      e.stopPropagation();
      userMenuDropdown.classList.toggle('hidden');
    };
    document.addEventListener('click', (e) => {
      if (!userMenuDropdown.classList.contains('hidden')) {
        userMenuDropdown.classList.add('hidden');
      }
    });
    this.updateUserMenu();
  }

  private updateUserMenu(): void {
    const userMenuDropdown = document.getElementById('user-menu-dropdown');
    const userAvatar = document.getElementById('user-avatar');
    const userMenuBtn = document.getElementById('user-menu-btn');
    if (!userMenuDropdown || !userAvatar || !userMenuBtn) return;
    const user = this.auth.getCurrentUser();
    if (user) {
      userMenuBtn.style.display = '';
      // Show avatar if available
      if (user.photoURL) {
        userAvatar.innerHTML = `<img src="${user.photoURL}" alt="avatar" style="width:40px;height:40px;border-radius:50%;object-fit:cover;display:block;" />`;
      } else {
        userAvatar.innerHTML = '<span class="material-icons">account_circle</span>';
      }
      const name = user.displayName || user.email;
      userMenuDropdown.innerHTML = `
        <div class="mb-2 text-sm text-gray-700">Logged in as <span class="font-semibold">${name}</span></div>
        <button id="dropdown-logout-btn" class="w-full bg-error text-white rounded px-3 py-2 text-sm hover:bg-error-dark transition">Log out</button>
      `;
      document.getElementById('dropdown-logout-btn')?.addEventListener('click', () => {
        this.auth.getCurrentUser() && this.auth["handleLogout"] && this.auth["handleLogout"]();
        userMenuDropdown.classList.add('hidden');
      });
    } else {
      userMenuBtn.style.display = 'none';
      userAvatar.innerHTML = '<span class="material-icons">account_circle</span>';
      userMenuDropdown.innerHTML = '';
    }
  }
}

// Initialize the application
document.addEventListener("DOMContentLoaded", () => {
  new ShoppingCart();
}); 