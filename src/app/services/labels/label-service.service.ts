import { inject, Injectable } from '@angular/core';
import { addDoc, collection, collectionData, deleteDoc, doc, docData, Firestore, setDoc } from '@angular/fire/firestore';
import { Label } from './label';
import { from, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LabelService {

    firestore = inject(Firestore);
    collection = collection(this.firestore, 'labels');

      getDrawings(): Observable<Label[]> {
        return collectionData(this.collection, { idField: 'id' }) as Observable<Label[]>;
      }
    
      getDrawing(id: string): Observable<Label> {
        return docData(doc(this.firestore, `labels/${id}`), { idField: 'id' }) as Observable<Label>;
      }
      
      addDrawing(label: Label): Observable<string> {
        return from(addDoc(this.collection, label).then(resp => resp.id));
      }
    
      deleteDrawing(id: string): Observable<void> {
        return from(deleteDoc(doc(this.firestore, `labels/${id}`)));
      }
    
      updateDrawing(label: Label): Observable<void> {
        return from(setDoc(doc(this.firestore, `labels/${label.id}`), label));
      }
}
