import { inject, Injectable } from '@angular/core';
import { addDoc, collection, collectionData, deleteDoc, doc, docData, Firestore, setDoc } from '@angular/fire/firestore';
import { Topic } from './topic';
import { from, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TopicService {

    firestore = inject(Firestore);
    collection = collection(this.firestore, 'topics');

      getTopics(): Observable<Topic[]> {
        return collectionData(this.collection, { idField: 'id' }) as Observable<Topic[]>;
      }
    
      getTopic(id: string): Observable<Topic> {
        return docData(doc(this.firestore, `topics/${id}`), { idField: 'id' }) as Observable<Topic>;
      }
      
      addTopic(topic: Topic): Observable<string> {
        return from(addDoc(this.collection, topic).then(resp => resp.id));
      }
    
      deleteTopic(id: string): Observable<void> {
        return from(deleteDoc(doc(this.firestore, `topics/${id}`)));
      }
    
      updateTopic(topic: Topic): Observable<void> {
        return from(setDoc(doc(this.firestore, `topics/${topic.id}`), topic));
      }
}
