import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentArchive } from './document-archive';

describe('DocumentArchive', () => {
  let component: DocumentArchive;
  let fixture: ComponentFixture<DocumentArchive>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DocumentArchive],
    }).compileComponents();

    fixture = TestBed.createComponent(DocumentArchive);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
