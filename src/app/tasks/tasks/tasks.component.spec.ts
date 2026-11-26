import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpErrorResponse, provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { provideTransloco } from '@ngneat/transloco';
import { MessageService } from 'primeng/api';

import { TasksComponent } from './tasks.component';
import { translocoTestConfig } from '../../translation-loader.service.spec';
import { API_URL } from '../../app.config';
import { EMPTY_PAGE, TaskDto } from '../../api';

describe('TasksComponent', () => {
  let component: TasksComponent;
  let fixture: ComponentFixture<TasksComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TasksComponent],
      providers: [
        provideHttpClient(),
        provideRouter([]),
        provideTransloco(translocoTestConfig),
        MessageService,
        {provide: API_URL, useValue: 'http://localhost'}
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TasksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should hide the exam task checkboxes', () => {
    expect(component.showExamTaskColumn).toBe(false);
    expect(fixture.nativeElement.querySelector('p-checkbox')).toBeNull();
  });

  it('should show the task ID search input', () => {
    expect(fixture.nativeElement.querySelector('#taskIdSearch')).not.toBeNull();
  });

  it('should load only the searched task', async () => {
    const task = {id: 42, title: 'Task 42'} as TaskDto;
    const getSpy = jest.spyOn(component['entityService'], 'get').mockResolvedValue({dto: task} as never);
    const loadSpy = jest.spyOn(component['entityService'], 'load').mockResolvedValue(EMPTY_PAGE);

    component.idSearch = 42;
    await component.searchById();

    expect(getSpy).toHaveBeenCalledWith(42);
    expect(loadSpy).not.toHaveBeenCalled();
    expect(component.activeIdSearch).toBe(42);
    expect(component.tableData.content).toEqual([task]);
    expect(component.tableData.page.totalElements).toBe(1);
  });

  it('should show an empty table if the searched task does not exist', async () => {
    jest.spyOn(component['entityService'], 'get').mockRejectedValue(new HttpErrorResponse({status: 404}));

    component.idSearch = 7;
    await component.searchById();

    expect(component.tableData.content).toEqual([]);
  });

  it('should load all tasks again after clearing the ID search', async () => {
    jest.spyOn(component['entityService'], 'get').mockResolvedValue({dto: {id: 1} as TaskDto} as never);
    const loadSpy = jest.spyOn(component['entityService'], 'load').mockResolvedValue(EMPTY_PAGE);

    component.idSearch = 1;
    await component.searchById();
    await component.clearIdSearch();

    expect(component.activeIdSearch).toBeNull();
    expect(component.idSearch).toBeNull();
    expect(loadSpy).toHaveBeenCalled();
  });
});
