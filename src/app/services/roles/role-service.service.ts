import { inject, Injectable } from '@angular/core';
import { addDoc, collection, collectionData, deleteDoc, doc, docData, Firestore, setDoc } from '@angular/fire/firestore';
import { Role } from './role';
import { from, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RoleService {

    firestore = inject(Firestore);
    collection = collection(this.firestore, 'roles');

      getRoles(): Observable<Role[]> {
        return collectionData(this.collection, { idField: 'id' }) as Observable<Role[]>;
      }
    
      getRole(id: string): Observable<Role> {
        return docData(doc(this.firestore, `roles/${id}`), { idField: 'id' }) as Observable<Role>;
      }
      
      addRole(role: Role): Observable<string> {
        return from(addDoc(this.collection, role).then(resp => resp.id));
      }
    
      deleteRole(id: string): Observable<void> {
        return from(deleteDoc(doc(this.firestore, `roles/${id}`)));
      }
    
      updateRole(role: Role): Observable<void> {
        return from(setDoc(doc(this.firestore, `roles/${role.id}`), role));
      }
}
