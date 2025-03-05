import { Component } from '@angular/core';
import { ButtonComponent } from "../../../components/button/button.component";

@Component({
  selector: 'app-topic-overview',
  standalone: true,
  imports: [ButtonComponent],
  templateUrl: './topic-overview.component.html',
  styleUrl: './topic-overview.component.css'
})
export class TopicOverviewComponent {

}
