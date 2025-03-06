import { TestBed } from '@angular/core/testing';

import { DrawingService } from './drawing-service.service';

describe('DrawingServiceService', () => {
  let service: DrawingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DrawingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
