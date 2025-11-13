import { AfterViewInit, Component, ElementRef, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { SchoolService } from '../../services/school.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-school-attendance',
  templateUrl: './attendance.component.html',
  styleUrls: ['./attendance.component.css']
})
export class AttendanceComponent implements OnInit, AfterViewInit, OnDestroy {
  photoData = '';
  message = '';
  error = '';
  loading = false;
  cameraError = '';
  capturedStudent: any = null;
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
    this.stopCamera();
    this.checkIn();
  }

  retakePhoto(): void {
    this.photoData = '';
    this.capturedStudent = null;
    this.message = '';
    this.error = '';
    this.startCamera();
  }

  checkIn(): void {
    this.error = '';
    this.message = '';

    if (!this.photoData) {
      this.error = 'Please capture a photo first';
      return;
    }

    this.loading = true;
    this.schoolService.checkInStudent({
      image_base64: this.photoData
    }).subscribe(
      (response) => {
        this.message = response.message || 'Attendance recorded successfully';
        this.capturedStudent = response.student || null;
        this.loading = false;
        // Auto retake after 3 seconds
        setTimeout(() => {
          this.retakePhoto();
        }, 3000);
      },
      (error) => {
        this.error = error.error?.error || 'Failed to record attendance';
        this.loading = false;
        // Allow retake on error
        setTimeout(() => {
          this.retakePhoto();
        }, 2000);
      }
    );
  }
}
