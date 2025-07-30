import { Component, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-signals-basic',
  imports: [CommonModule, FormsModule], // Add these imports back!
  templateUrl: './signals-basic.html',
  styleUrl: './signals-basic.scss'
})
export class SignalsBasic {
  // Your existing code is perfect - keep it all!
  
  // Basic signals
  count = signal(0);
  firstName = signal('');
  lastName = signal('');
  
  // Array signal for todos
  todos = signal<{text: string, completed: boolean}[]>([
    { text: 'Learn Angular Signals', completed: false },
    { text: 'Build awesome apps', completed: false }
  ]);

  // Computed signals
  doubleCount = computed(() => this.count() * 2);
  squareCount = computed(() => this.count() ** 2);
  isEven = computed(() => this.count() % 2 === 0);
  fullName = computed(() => {
    const first = this.firstName().trim();
    const last = this.lastName().trim();
    return first && last ? `${first} ${last}` : first || last || 'Anonymous';
  });

  // Todo computed signals
  todoCount = computed(() => this.todos().length);
  completedCount = computed(() => this.todos().filter(t => t.completed).length);
  remainingCount = computed(() => this.todos().filter(t => !t.completed).length);

  constructor() {
    // Effects for logging changes
    effect(() => {
      console.log('Count changed to:', this.count());
    });

    effect(() => {
      console.log('Full name is now:', this.fullName());
    });

    effect(() => {
      console.log('Todo stats:', {
        total: this.todoCount(),
        completed: this.completedCount(),
        remaining: this.remainingCount()
      });
    });
  }

  // Counter methods
  increment() {
    this.count.update(value => value + 1);
  }

  decrement() {
    this.count.update(value => value - 1);
  }

  reset() {
    this.count.set(0);
  }

  // Text input methods
  updateFirstName(event: Event) {
    const input = event.target as HTMLInputElement;
    this.firstName.set(input.value);
  }

  updateLastName(event: Event) {
    const input = event.target as HTMLInputElement;
  }

  // Todo methods
  addTodo(text: string) {
    if (text.trim()) {
      this.todos.update(todos => [
        ...todos,
        { text: text.trim(), completed: false }
      ]);
    }
  }

  removeTodo(index: number) {
    this.todos.update(todos => todos.filter((_, i) => i !== index));
  }

  toggleTodo(index: number) {
    this.todos.update(todos => 
      todos.map((todo, i) => 
        i === index ? { ...todo, completed: !todo.completed } : todo
      )
    );
  }
}