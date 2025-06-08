import { Component, OnInit, ViewChild, ElementRef, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AiService, ChatResponse } from '../../services/ai.service';
import { finalize } from 'rxjs/operators';
import { environment } from '../../../../environments/environment.development';

interface ChatMessage {
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  isError?: boolean;
  image?: string; // Base64 image data
}

@Component({
  selector: 'app-ai-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ai-chatbot.component.html',
  styleUrls: ['./ai-chatbot.component.scss']
})
export class AiChatbotComponent implements OnInit {
  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  isOpen = signal(false);
  messages = signal<ChatMessage[]>([]);
  userInput = signal('');
  isLoading = signal(false);
  selectedImage = signal<File | null>(null);
  imagePreview = signal<string | null>(null);

  // Computed properties
  hasMessages = computed(() => this.messages().length > 0);
  canSend = computed(() => this.userInput().trim().length > 0 || this.selectedImage() !== null);

  constructor(
    private aiService: AiService,
    private httpClient: HttpClient
  ) {}

  ngOnInit(): void {
    // Add welcome message with examples
    const welcomeMessage = `Hi! I'm your AI sneaker shopping assistant. I have access to all products in our database.

You can ask me things like:
• "Show me running shoes under 3 million VND"
• "What are the best Nike sneakers on sale?"
• "Compare Adidas and Nike basketball shoes"
• "I need comfortable shoes for daily wear"
• "What sneakers do you have in size 42?"

How can I help you find the perfect sneakers today?`;
    
    this.addMessage(welcomeMessage, 'bot');
    
    // Check if AI is initialized
    this.checkAIStatus();
  }

  toggleChat(): void {
    this.isOpen.update(v => !v);
  }

  sendMessage(): void {
    if (!this.canSend() || this.isLoading()) return;

    const message = this.userInput().trim();
    const image = this.selectedImage();

    if (message && !image) {
      this.addMessage(message, 'user');
    }

    if (image && message) {
      // Send image with prompt
      const preview = this.imagePreview();
      if (preview) {
        this.addMessageWithImage(message, 'user', preview);
      }
      this.sendImageMessage(image, message);
    } else if (image) {
      // Send image with default prompt
      const preview = this.imagePreview();
      if (preview) {
        this.addMessageWithImage('What can you tell me about this sneaker?', 'user', preview);
      }
      this.sendImageMessage(image, 'What can you tell me about this sneaker?');
    } else if (message) {
      // Send text message
      this.sendTextMessage(message);
    }

    // Clear input
    this.userInput.set('');
    this.clearImage();
  }

  private sendTextMessage(message: string): void {
    this.isLoading.set(true);

    this.aiService.productAssistant(message)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (response: ChatResponse) => {
          if (response.success) {
            this.addMessage(response.response, 'bot');
          } else {
            this.addMessage('Sorry, I couldn\'t process your request.', 'bot', true);
          }
        },
        error: (error) => {
          console.error('Chat error:', error);
          this.addMessage('Sorry, something went wrong. Please try again.', 'bot', true);
        }
      });
  }

  private sendImageMessage(image: File, prompt: string): void {
    this.isLoading.set(true);

    // Validate image size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (image.size > maxSize) {
      this.addMessage('Image size too large. Please upload an image smaller than 5MB.', 'bot', true);
      this.isLoading.set(false);
      return;
    }

    // Validate image type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(image.type)) {
      this.addMessage('Invalid image type. Please upload a JPEG, PNG, GIF, or WebP image.', 'bot', true);
      this.isLoading.set(false);
      return;
    }

    console.log('Uploading image:', { name: image.name, size: image.size, type: image.type });

    this.aiService.chatWithImage(image, prompt)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (response: ChatResponse) => {
          if (response.success) {
            this.addMessage(response.response, 'bot');
          } else {
            this.addMessage('Sorry, I couldn\'t analyze the image.', 'bot', true);
          }
        },
        error: (error) => {
          console.error('Image chat error:', error);
          let errorMessage = 'Sorry, something went wrong while analyzing the image.';
          
          if (error.status === 413) {
            errorMessage = 'Image file is too large. Please try a smaller image.';
          } else if (error.status === 415) {
            errorMessage = 'Unsupported image format. Please use JPEG, PNG, GIF, or WebP.';
          } else if (error.status === 400 && error.error?.error) {
            errorMessage = error.error.error;
          }
          
          this.addMessage(errorMessage, 'bot', true);
        }
      });
  }

  private addMessage(content: string, sender: 'user' | 'bot', isError: boolean = false): void {
    this.messages.update(msgs => [...msgs, {
      content,
      sender,
      timestamp: new Date(),
      isError
    }]);
    this.scrollToBottom();
  }

  private addMessageWithImage(content: string, sender: 'user' | 'bot', image: string, isError: boolean = false): void {
    this.messages.update(msgs => [...msgs, {
      content,
      sender,
      timestamp: new Date(),
      isError,
      image
    }]);
    this.scrollToBottom();
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.selectedImage.set(file);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        this.imagePreview.set(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  clearImage(): void {
    this.selectedImage.set(null);
    this.imagePreview.set(null);
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }

  triggerFileInput(): void {
    this.fileInput.nativeElement.click();
  }

  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      if (this.scrollContainer) {
        const element = this.scrollContainer.nativeElement;
        element.scrollTop = element.scrollHeight;
      }
    }, 100);
  }

  clearChat(): void {
    this.messages.set([]);
    const welcomeMessage = `Hi! I'm your AI sneaker shopping assistant. I have access to all products in our database.

You can ask me things like:
• "Show me running shoes under 3 million VND"
• "What are the best Nike sneakers on sale?"
• "Compare Adidas and Nike basketball shoes"
• "I need comfortable shoes for daily wear"
• "What sneakers do you have in size 42?"

How can I help you find the perfect sneakers today?`;
    
    this.addMessage(welcomeMessage, 'bot');
  }

  private checkAIStatus(): void {
    // Check if AI index is initialized
    const apiUrl = environment.apiUrl;
    this.httpClient.get<{success: boolean; status: string; documentCount: number}>(`${apiUrl}ai/initialize/status`)
      .subscribe({
        next: (response) => {
          if (response.success && response.status === 'not_initialized') {
            this.addMessage('💡 Tip: Ask an admin to initialize the AI database for better product search results.', 'bot');
          }
        },
        error: (error: any) => {
          console.error('Failed to check AI status:', error);
        }
      });
  }

  initializeAI(): void {
    this.isLoading.set(true);
    this.addMessage('Initializing AI database with all products...', 'bot');
    
    const apiUrl = environment.apiUrl;
    this.httpClient.post<{success: boolean; message: string}>(`${apiUrl}ai/initialize/index-all`, {})
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.addMessage('✅ AI database initialized successfully! I now have access to all products.', 'bot');
          } else {
            this.addMessage('Failed to initialize AI database.', 'bot', true);
          }
        },
        error: (error: any) => {
          console.error('Failed to initialize AI:', error);
          this.addMessage('Error initializing AI database. Please try again later.', 'bot', true);
        }
      });
  }
} 