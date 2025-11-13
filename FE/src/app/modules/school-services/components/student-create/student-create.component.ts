import { AfterViewInit, Component, ElementRef, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { SchoolService } from '../../services/school.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-student-create',
  templateUrl: './student-create.component.html',
  styleUrls: ['./student-create.component.css']
})
export class StudentCreateComponent implements OnInit, AfterViewInit, OnDestroy {
  form = {
    full_name: '',
    grade: '',
    class_name: ''
  };
  photoData = '';
  message = '';
  error = '';
  submitting = false;
  cameraError = '';
  user: any = null;
  showUserMenu = false;

  @ViewChild('videoElement') videoRef!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvasElement') canvasRef!: ElementRef<HTMLCanvasElement>;

  private mediaStream: MediaStream | null = null;

  constructor(
    private schoolService: SchoolService,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadUser();
  }

  loadUser(): void {
    const token = this.authService.getToken();
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        this.user = {
          id: payload.id,
          email: payload.email,
          full_name: payload.full_name || 'School Admin'
        };
      } catch (e) {
        console.error('Error decoding token:', e);
      }
    }
  }

  logout(): void {
    this.authService.clearToken();
    this.router.navigate(['/school-services/login']);
  }

  ngAfterViewInit(): void {
    this.startCamera();
  }

  ngOnDestroy(): void {
    this.stopCamera();
  }

  async startCamera(): Promise<void> {
    try {
      this.cameraError = '';
      if (!navigator.mediaDevices?.getUserMedia) {
        this.cameraError = 'Camera access is not supported on this device.';
        return;
      }
      this.mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (this.videoRef?.nativeElement) {
        this.videoRef.nativeElement.srcObject = this.mediaStream;
        await this.videoRef.nativeElement.play();
      }
    } catch (error) {
      console.error('Camera error:', error);
      this.cameraError = 'Unable to access camera. Please grant permission or check your device.';
    }
  }

  stopCamera(): void {
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }
    if (this.videoRef?.nativeElement) {
      this.videoRef.nativeElement.srcObject = null;
    }
  }

  capturePhoto(): void {
    if (!this.videoRef || !this.canvasRef) {
      return;
    }
    const video = this.videoRef.nativeElement;
    const canvas = this.canvasRef.nativeElement;
    const context = canvas.getContext('2d');
    if (!context) {
      this.cameraError = 'Unable to capture photo.';
      return;
    }
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    this.photoData = canvas.toDataURL('image/png');
    this.message = 'Photo captured. You can retake if needed.';
    this.stopCamera();
  }

  retakePhoto(): void {
    this.photoData = '';
    this.message = '';
    this.startCamera();
  }

  submit(): void {
    this.error = '';
    this.message = '';

    if (!this.form.full_name.trim()) {
      this.error = 'Student name is required';
      return;
    }

    if (!this.photoData) {
      this.error = 'Please capture a photo before saving';
      return;
    }

    this.submitting = true;

    this.schoolService.createStudent({
      full_name: this.form.full_name.trim(),
      grade: this.form.grade.trim() || undefined,
      class_name: this.form.class_name.trim() || undefined,
      photo_base64: this.photoData
    }).subscribe(
      (response) => {
        this.message = response.message || 'Student created successfully';
        this.submitting = false;
        setTimeout(() => this.router.navigate(['/school-services/students']), 1200);
      },
      (error) => {
        console.error('Create student error:', error);
        this.error = error.error?.error || 'Failed to create student';
        this.submitting = false;
      }
    );
  }
}
