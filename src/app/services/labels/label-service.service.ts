import { inject, Injectable } from '@angular/core';
import { addDoc, collection, collectionData, deleteDoc, doc, docData, Firestore, query, setDoc, where } from '@angular/fire/firestore';
import { Label } from './label';
import { from, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LabelService {

    firestore = inject(Firestore);
    collection = collection(this.firestore, 'labels');

      getLabels(): Observable<Label[]> {
        return collectionData(this.collection, { idField: 'id' }) as Observable<Label[]>;
      }

      getLabelsByTopic(topicId: string): Observable<Label[]> {
        const labelsQuery = query(this.collection, where('topic_id', '==', topicId));
        return collectionData(labelsQuery, { idField: 'id' }) as Observable<Label[]>;
      }
    
      getLabel(id: string): Observable<Label> {
        return docData(doc(this.firestore, `labels/${id}`), { idField: 'id' }) as Observable<Label>;
      }
      
      addLabel(label: Label): Observable<string> {
        return from(addDoc(this.collection, label).then(resp => resp.id));
      }
    
      deleteLabel(id: string): Observable<void> {
        return from(deleteDoc(doc(this.firestore, `labels/${id}`)));
      }
    
      updateLabel(label: Label): Observable<void> {
        return from(setDoc(doc(this.firestore, `labels/${label.id}`), label));
      }
}
