import { Component, signal, computed, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { catchError, of, map } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';

// Types for our data
interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  website: string;
  company: {
    name: string;
  };
}

interface Post {
  id: number;
  userId: number;
  title: string;
  body: string;
}

interface LoadingState {
  users: boolean;
  posts: boolean;
  creating: boolean;
}

interface ApiError {
  message: string;
  status?: number;
}

@Component({
  selector: 'app-signals-advanced',
  imports: [CommonModule, FormsModule, ReactiveFormsModule], // Add these imports
  templateUrl: './signals-advanced.html',
  styleUrl: './signals-advanced.scss'
})
export class SignalsAdvanced {
  private http = inject(HttpClient);
  private fb = inject(FormBuilder);

  // Base signals
  users = signal<User[]>([]);
  posts = signal<Post[]>([]);
  selectedUserId = signal<number | null>(null);
  loading = signal<LoadingState>({ users: false, posts: false, creating: false });
  error = signal<ApiError | null>(null);

  // Computed signals
  totalUsers = computed(() => this.users().length);
  totalPosts = computed(() => this.posts().length);
  
  selectedUser = computed(() => 
    this.users().find(user => user.id === this.selectedUserId()) || null
  );
  
  userPosts = computed(() => 
    this.posts().filter(post => post.userId === this.selectedUserId())
  );

  avgPostsPerUser = computed(() => {
    const users = this.totalUsers();
    const posts = this.totalPosts();
    return users > 0 ? (posts / users).toFixed(1) : '0';
  });

  anyLoading = computed(() => 
    Object.values(this.loading()).some(isLoading => isLoading)
  );

  // Reactive form
  postForm: FormGroup = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(5)]],
    body: ['', [Validators.required, Validators.minLength(10)]]
  });

  // Convert form value to signal
  formValue = toSignal(this.postForm.valueChanges.pipe(
    map(value => value)
  ), { initialValue: this.postForm.value });

  constructor() {
    // Effects for side effects and logging
    effect(() => {
      console.log('Users count changed:', this.totalUsers());
    });

    effect(() => {
      console.log('Selected user:', this.selectedUser()?.name || 'None');
      // Clear posts when user changes
      if (this.selectedUserId()) {
        this.posts.set([]);
      }
    });

    effect(() => {
      const error = this.error();
      if (error) {
        console.error('API Error:', error);
        // Auto-clear error after 5 seconds
        setTimeout(() => this.clearError(), 5000);
      }
    });

    // Auto-load users on component init
    this.loadUsers();
  }

  // HTTP Methods with Signal updates
  loadUsers() {
    this.setLoading('users', true);
    this.clearError();

    this.http.get<User[]>('https://jsonplaceholder.typicode.com/users')
      .pipe(
        catchError(err => {
          this.setError({ message: 'Failed to load users', status: err.status });
          return of([]);
        })
      )
      .subscribe(users => {
        this.users.set(users);
        this.setLoading('users', false);
      });
  }

  loadUserPosts() {
    const userId = this.selectedUserId();
    if (!userId) return;

    this.setLoading('posts', true);
    this.clearError();

    this.http.get<Post[]>(`https://jsonplaceholder.typicode.com/posts?userId=${userId}`)
      .pipe(
        catchError(err => {
          this.setError({ message: 'Failed to load posts', status: err.status });
          return of([]);
        })
      )
      .subscribe(posts => {
        this.posts.set(posts);
        this.setLoading('posts', false);
      });
  }

  createPost() {
    if (this.postForm.invalid || !this.selectedUserId()) return;

    this.setLoading('creating', true);
    this.clearError();

    const newPost = {
      ...this.postForm.value,
      userId: this.selectedUserId()
    };

    this.http.post<Post>('https://jsonplaceholder.typicode.com/posts', newPost)
      .pipe(
        catchError(err => {
          this.setError({ message: 'Failed to create post', status: err.status });
          return of(null);
        })
      )
      .subscribe(post => {
        if (post) {
          // Add new post to existing posts
          this.posts.update(posts => [post, ...posts]);
          this.resetForm();
        }
        this.setLoading('creating', false);
      });
  }

  // Helper methods
  selectUser(userId: number) {
    this.selectedUserId.set(userId);
  }

  clearUsers() {
    this.users.set([]);
    this.posts.set([]);
    this.selectedUserId.set(null);
  }

  resetForm() {
    this.postForm.reset();
  }

  clearError() {
    this.error.set(null);
  }

  private setLoading(key: keyof LoadingState, value: boolean) {
    this.loading.update(current => ({ ...current, [key]: value }));
  }

  private setError(error: ApiError) {
    this.error.set(error);
  }
}