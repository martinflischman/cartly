import { 
  signInWithGoogle, 
  signInWithEmail, 
  signUpWithEmail,
  logout,
  onAuthStateChange,
  User
} from '../config/firebase';
import { updateProfile } from 'firebase/auth';

export class Auth {
  private authContainer: HTMLDivElement;
  private currentUser: User | null = null;
  private isSignUpMode: boolean = false;

  constructor() {
    this.authContainer = document.createElement('div');
    this.authContainer.className = 'auth-container';
    this.initializeAuth();
  }

  private async initializeAuth(): Promise<void> {
    // Listen for auth state changes
    onAuthStateChange((user) => {
      this.currentUser = user;
      this.updateUI();
    });

    // Create auth UI
    this.createAuthUI();
  }

  private createAuthUI(): void {
    this.authContainer.innerHTML = `
      <div class="auth-box flex flex-col items-center justify-center">
        <div class="auth-headings w-full flex flex-col items-center justify-center">
          <h2 class="text-base sm:text-lg font-semibold text-primary text-center mb-1" style="font-family: Inter, sans-serif;">Welcome to</h2>
          <h3 class="text-4xl sm:text-5xl font-black text-primary text-center mb-8 mt-0" style="font-family: Inter, sans-serif;">Cartly</h3>
        </div>
        <div id="auth-content" class="w-full"></div>
      </div>
    `;

    document.body.insertBefore(this.authContainer, document.body.firstChild);
    this.updateUI();
  }

  private updateUI(): void {
    const authContent = document.getElementById('auth-content');
    if (!authContent) return;

    if (this.currentUser) {
      // Hide auth box and let main app show
      this.authContainer.style.display = 'none';
      return;
    } else {
      this.authContainer.style.display = '';
      // Sign In/Sign Up form
      authContent.innerHTML = `
        <div class="space-y-3">
          <button id="google-signin" class="auth-form-element w-full flex flex-row items-center justify-center bg-white border border-gray-300 text-gray-600 p-3 rounded-full hover:bg-gray-50 transition-colors duration-200">
            <img src="https://www.google.com/favicon.ico" alt="Google" class="w-5 h-5 self-center mr-2" style="display:block;" />
            <span class="font-medium text-center w-full">${this.isSignUpMode ? 'Sign up with Google' : 'Sign in with Google'}</span>
          </button>
          <div class="relative">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-gray-300"></div>
            </div>
            <div class="relative flex justify-center text-sm">
              <span class="px-2 bg-white text-gray-500">Or</span>
            </div>
          </div>
          <form id="email-form" class="space-y-3">
            ${this.isSignUpMode ? `
              <input type="text" id="name" placeholder="Name" required class="auth-form-element w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
            ` : ''}
            <input type="email" id="email" placeholder="Email" required autocomplete="email" class="auth-form-element w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
            <input type="password" id="password" placeholder="Password" required autocomplete="${this.isSignUpMode ? 'new-password' : 'current-password'}" class="auth-form-element w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
            ${this.isSignUpMode ? `
              <input type="password" id="confirm-password" placeholder="Confirm Password" required autocomplete="new-password" class="auth-form-element w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
            ` : ''}
            <button type="submit" id="email-signin" class="auth-form-element w-full bg-primary-600 text-white p-3 rounded-lg hover:bg-primary-700 transition-colors duration-200">
              ${this.isSignUpMode ? 'Sign Up' : 'Sign In'}
            </button>
          </form>
          <p class="text-center text-sm text-gray-600">
            ${this.isSignUpMode ? 'Already have an account?' : "Don't have an account?"}
            <button id="toggle-signup" class="text-primary-600 hover:text-primary-700">
              ${this.isSignUpMode ? 'Sign In' : 'Sign Up'}
            </button>
          </p>
        </div>
      `;
      document.getElementById('google-signin')?.addEventListener('click', () => this.handleGoogleSignIn());
      document.getElementById('email-form')?.addEventListener('submit', (e) => this.handleEmailAuth(e));
      document.getElementById('toggle-signup')?.addEventListener('click', () => this.toggleSignUp());
    }
  }

  private async handleGoogleSignIn(): Promise<void> {
    try {
      const button = document.getElementById('google-signin') as HTMLButtonElement;
      if (button) {
        button.disabled = true;
        button.innerHTML = '<span class="animate-spin">⌛</span> Signing in...';
      }
      await signInWithGoogle();
    } catch (error: any) {
      let errorMessage = 'Failed to sign in with Google';
      if (error.code === 'auth/popup-blocked') {
        errorMessage = 'Please allow popups for this website';
      } else if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = 'Sign in was cancelled';
      } else if (error.code === 'auth/cancelled-popup-request') {
        errorMessage = 'Sign in was cancelled';
      }
      this.showError(errorMessage);
    } finally {
      const button = document.getElementById('google-signin') as HTMLButtonElement;
      if (button) {
        button.disabled = false;
        button.innerHTML = `
          <img src="https://www.google.com/favicon.ico" alt="Google" class="w-5 h-5">
          <span>Sign in with Google</span>
        `;
      }
    }
  }

  private async handleEmailAuth(event: Event): Promise<void> {
    event.preventDefault();
    const email = (document.getElementById('email') as HTMLInputElement).value;
    const password = (document.getElementById('password') as HTMLInputElement).value;
    const isSignUp = this.isSignUpMode;
    const submitButton = document.getElementById('email-signin') as HTMLButtonElement;
    let name = '';
    let confirmPassword = '';
    if (isSignUp) {
      name = (document.getElementById('name') as HTMLInputElement).value;
      confirmPassword = (document.getElementById('confirm-password') as HTMLInputElement).value;
      if (!name.trim()) {
        this.showError('Name is required');
        return;
      }
      if (password !== confirmPassword) {
        this.showError('Passwords do not match');
        return;
      }
    }
    try {
      submitButton.disabled = true;
      submitButton.textContent = isSignUp ? 'Signing up...' : 'Signing in...';
      
      if (isSignUp) {
        const user = await signUpWithEmail(email, password);
        if (user && name) {
          // Update displayName after sign up
          await updateProfile(user, { displayName: name });
        }
      } else {
        await signInWithEmail(email, password);
      }
    } catch (error: any) {
      let errorMessage = isSignUp ? 'Failed to sign up' : 'Failed to sign in';
      
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'This email is already registered';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Please enter a valid email address';
          break;
        case 'auth/operation-not-allowed':
          errorMessage = 'Email/password accounts are not enabled';
          break;
        case 'auth/weak-password':
          errorMessage = 'Password should be at least 6 characters';
          break;
        case 'auth/user-disabled':
          errorMessage = 'This account has been disabled';
          break;
        case 'auth/user-not-found':
          errorMessage = 'No account found with this email';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Incorrect password';
          break;
      }
      
      this.showError(errorMessage);
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = isSignUp ? 'Sign Up' : 'Sign In';
    }
  }

  private async handleLogout(): Promise<void> {
    try {
      const button = document.getElementById('logout-button') as HTMLButtonElement;
      if (button) {
        button.disabled = true;
        button.textContent = 'Signing out...';
      }
      await logout();
    } catch (error) {
      this.showError('Failed to sign out');
    } finally {
      const button = document.getElementById('logout-button') as HTMLButtonElement;
      if (button) {
        button.disabled = false;
        button.textContent = 'Sign Out';
      }
    }
  }

  private toggleSignUp(): void {
    this.isSignUpMode = !this.isSignUpMode;
    this.updateUI();
  }

  private showError(message: string): void {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mt-4';
    errorDiv.innerHTML = `
      <div class="flex items-center">
        <span class="material-icons mr-2 text-red-500">error</span>
        <span>${message}</span>
      </div>
    `;
    
    const authContent = document.getElementById('auth-content');
    if (authContent) {
      authContent.insertBefore(errorDiv, authContent.firstChild);
      setTimeout(() => {
        errorDiv.style.opacity = '0';
        errorDiv.style.transition = 'opacity 0.5s ease-out';
        setTimeout(() => errorDiv.remove(), 500);
      }, 3000);
    }
  }

  public isAuthenticated(): boolean {
    return !!this.currentUser;
  }

  public getCurrentUser(): User | null {
    return this.currentUser;
  }
} 