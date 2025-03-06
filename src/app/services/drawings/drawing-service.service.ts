import { inject, Injectable } from '@angular/core';
import { addDoc, collection, collectionData, deleteDoc, doc, docData, Firestore, getDoc, setDoc, updateDoc } from '@angular/fire/firestore';
import { from, Observable } from 'rxjs';
import { Drawing } from './drawing';

@Injectable({
  providedIn: 'root'
})
export class DrawingService {

  firestore = inject(Firestore);
  collection = collection(this.firestore, 'drawings');

  getDrawings(): Observable<Drawing[]> {
    return collectionData(this.collection, { idField: 'id' }) as Observable<Drawing[]>;
  }

  getDrawing(id: string): Observable<Drawing> {
    return docData(doc(this.firestore, `drawings/${id}`), { idField: 'id' }) as Observable<Drawing>;
  }
  
  addDrawing(drawing: Drawing): Observable<string> {
    return from(addDoc(this.collection, drawing).then(resp => resp.id));
  }

  deleteDrawing(id: string): Observable<void> {
    return from(deleteDoc(doc(this.firestore, `drawings/${id}`)));
  }

  updateDrawing(drawing: Drawing): Observable<void> {
    return from(setDoc(doc(this.firestore, `drawings/${drawing.id}`), drawing));
  }
}
