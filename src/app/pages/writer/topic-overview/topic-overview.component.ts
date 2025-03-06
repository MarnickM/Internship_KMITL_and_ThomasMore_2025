import { Component } from '@angular/core';
import { ButtonComponent } from "../../../components/button/button.component";
import { TopicService } from "../../../services/topics/topic-service.service";
import { Topic } from '../../../services/topics/topic';


@Component({
  selector: 'app-topic-overview',
  standalone: true,
  imports: [ButtonComponent],
  templateUrl: './topic-overview.component.html',
  styleUrl: './topic-overview.component.css'
})
export class TopicOverviewComponent {

  topics: Topic[] | undefined;

  constructor(private topicService: TopicService) { }

  ngOnInit() {
    this.topicService.getTopics().subscribe(topics => {
      this.topics = topics;
    });
  }
}
