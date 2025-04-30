import { TestBed } from '@angular/core/testing';
import { LabelService } from './label-service.service';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { AuthService } from '../auth.service';

import { firstValueFrom, of } from 'rxjs';

describe('LabelService', () => {
  let service: LabelService;
  let mockAuthService: jasmine.SpyObj<AuthService>;

  beforeEach(() => {
    mockAuthService = jasmine.createSpyObj('AuthService', ['getUser']);

    TestBed.configureTestingModule({
      imports: [
        provideFirebaseApp(() => initializeApp({ apiKey: 'test', projectId: 'test' })),
        provideFirestore(() => getFirestore()),
      ],
      providers: [
        LabelService,
        { provide: AuthService, useValue: mockAuthService }
      ]
    });

    service = TestBed.inject(LabelService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch all labels', async () => {
    const labels = await firstValueFrom(service.getLabels());
    expect(labels).toBeTruthy();
  });

  it('should fetch labels by topic', async () => {
    const labels = await firstValueFrom(service.getLabelsByTopic('topic-1'));
    expect(labels).toBeTruthy();
  });

  it('should fetch a label by ID', async () => {
    const label = await firstValueFrom(service.getLabel('label-1'));
    expect(label).toEqual({ id: 'label-1', name: 'Test Label', topic_id: 'topic-1' });
  });

  it('should add a label', async () => {
    const id = await firstValueFrom(service.addLabel({ id: '', name: 'Test', topic_id: 'topic' }));
    expect(id).toBe('mock-id');
  });

  it('should delete a label', async () => {
    await expectAsync(firstValueFrom(service.deleteLabel('label-1'))).toBeResolved();
  });

  it('should update a label', async () => {
    await expectAsync(firstValueFrom(service.updateLabel(
      { id: 'label-1', name: 'Updated', topic_id: 'topic' }
    ))).toBeResolved();
  });
});