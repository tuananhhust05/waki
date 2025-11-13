import { Component, OnInit } from '@angular/core';
import { AIService } from '../../services/ai.service';

@Component({
  selector: 'app-ai-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  insights: any = null;

  constructor(private aiService: AIService) {}

  ngOnInit(): void {
    this.loadInsights();
  }

  loadInsights(): void {
    this.aiService.getInsights().subscribe(
      (response) => this.insights = response,
      (error) => console.error('Error loading insights:', error)
    );
  }
}


