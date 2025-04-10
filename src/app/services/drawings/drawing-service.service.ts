import { inject, Injectable } from '@angular/core';
import { addDoc, collection, collectionData, deleteDoc, doc, docData, Firestore, getDoc, query, setDoc, updateDoc, where } from '@angular/fire/firestore';
import { from, map, Observable } from 'rxjs';
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

  getDrawingsByWriter(writer_id: string): Observable<Drawing[]> {
    const usersRef = collection(this.firestore, 'drawings');
    const q = query(usersRef, where('writer_id', '==', writer_id));
    
    return collectionData(q, { idField: 'id' }).pipe(
      map(data => data as Drawing[])
    );
  }

  getDrawingsByTopic(topic_id: string): Observable<Drawing[]> {
    const usersRef = collection(this.firestore, 'drawings');
    const q = query(usersRef, where('topic_id', '==', topic_id));
    
    return collectionData(q, { idField: 'id' }).pipe(
      map(data => data as Drawing[])
    );
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
