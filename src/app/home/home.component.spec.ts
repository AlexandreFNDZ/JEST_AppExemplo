import { HttpResponse } from '@angular/common/http';
import { defer } from 'rxjs';

import { HomeComponent } from './home.component';
import { flushMicrotasks, fakeAsync } from '@angular/core/testing';

const mockProducts = [{
  id: 1,
  name: "Name",
  description: "Description",
  price: "75.00",
  imageUrl: "https://source.unsplash.com/1600x900/?product",
  quantity: 56349
}];
const mockResponse = new HttpResponse<any>({body: mockProducts});

function asyncData<T>(data: T) {
  return defer(() => Promise.resolve(data));
}

function asyncError<T>(errorObject: any) {
  return defer(() => Promise.reject(errorObject));
}

describe('HomeComponent - Unit', () => {
  let homeComponent: HomeComponent;
  let mockApiServiceComponent;
  const provide = (mock: any): any => mock;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();

    mockApiServiceComponent = {
      get: jest.fn(() => asyncData(mockResponse)),
      sendGetRequestToUrl: jest.fn(() => asyncData(mockResponse)),
      first: 'http://localhost:3000/products?_page=1&_limit=4',
      last: 'http://localhost:3000/products?_page=100&_limit=4',
      prev: 'http://localhost:3000/products?_page=2&_limit=4',
      next: 'http://localhost:3000/products?_page=4&_limit=4'
    };

    homeComponent = new HomeComponent(provide(mockApiServiceComponent));
  });

  it('should create', () => {
    expect(homeComponent).toBeTruthy();
  });
  
  it('should populate products when created', fakeAsync(() => {
    // When
    homeComponent.ngOnInit();
    flushMicrotasks();

    // Then
    expect(homeComponent.products).toEqual(mockProducts);
  }));

/*
  it('should unsubscribe when destroy', () => {
    // Given
    homeComponent.destroy$.next = jest.fn();
    homeComponent.destroy$.unsubscribe = jest.fn();

    // When
    homeComponent.ngOnDestroy();

    // Then
    expect(homeComponent.destroy$.next).toHaveBeenCalledWith(true);
    expect(homeComponent.destroy$.unsubscribe).toHaveBeenCalled();
  });
*/

  it('should unsubscribe when destroy with spy', () => {
    // Given
    const nextSpy = jest.spyOn(homeComponent.destroy$, 'next');
    const unsubscribeSpy = jest.spyOn(homeComponent.destroy$, 'unsubscribe');

    // When
    homeComponent.ngOnDestroy();

    // Then
    expect(nextSpy).toHaveBeenCalledWith(true);
    expect(unsubscribeSpy).toHaveBeenCalled();
  });

  it('should populate products when call first page', fakeAsync(() => {
    // Given
    const mockProductsFirstPage = [{
      id: 1,
      name: "Name page 1",
      description: "Description page 1",
      price: "75.00",
      imageUrl: "https://source.unsplash.com/1600x900/?product",
      quantity: 56349
    }];
    const mockResponseFirstPage = new HttpResponse<any>({ body: mockProductsFirstPage });
    mockApiServiceComponent.sendGetRequestToUrl.mockImplementationOnce(() => asyncData(mockResponseFirstPage));

    // When
    homeComponent.firstPage();
    flushMicrotasks();

    // Then
    expect(homeComponent.products).toEqual(mockProductsFirstPage);
    expect(mockApiServiceComponent.sendGetRequestToUrl).toHaveBeenCalledWith(mockApiServiceComponent.first);
  }));

  describe('suit for previousPage function', () => {
    it('should populate products when call prev page', fakeAsync(() => {
      // Given
      const mockProductsPrevPage = [{
        id: 1,
        name: "Name prev page 1",
        description: "Description prev page 1",
        price: "175.00",
        imageUrl: "https://source.unsplash.com/1600x900/?product",
        quantity: 21566
      }];
      const mockResponsePrevPage = new HttpResponse<any>({ body: mockProductsPrevPage });
      mockApiServiceComponent.sendGetRequestToUrl.mockImplementationOnce(() => asyncData(mockResponsePrevPage));
  
      // When
      homeComponent.previousPage();
      flushMicrotasks();
  
      // Then
      expect(homeComponent.products).toEqual(mockProductsPrevPage);
      expect(mockApiServiceComponent.sendGetRequestToUrl).toHaveBeenCalledWith(mockApiServiceComponent.prev);
    }));
  
    it('should do nothing when call prev page and do not have prev products', fakeAsync(() => {
      // Given
      mockApiServiceComponent.prev = '';
      const mockResponsePrevPage = new HttpResponse<any>({ body: '' });
      mockApiServiceComponent.sendGetRequestToUrl.mockImplementationOnce(() => asyncData(mockResponsePrevPage));
  
      // When
      homeComponent.previousPage();
      flushMicrotasks();
  
      // Then
      expect(mockApiServiceComponent.sendGetRequestToUrl).not.toHaveBeenCalled();
    }));
  
    it('should do nothing when call prev page and prev products is undefined', fakeAsync(() => {
      // Given
      mockApiServiceComponent.prev = undefined;
      const mockResponsePrevPage = new HttpResponse<any>({ body: '' });
      mockApiServiceComponent.sendGetRequestToUrl.mockImplementationOnce(() => asyncData(mockResponsePrevPage));
  
      // When
      homeComponent.previousPage();
      flushMicrotasks();
  
      // Then
      expect(mockApiServiceComponent.sendGetRequestToUrl).not.toHaveBeenCalled();
    }));
  });

  describe('suit for nextPage function', () => {
    it('should populate products when call next page', fakeAsync(() => {
      // Given
      const mockProductsNextPage = [{
        id: 1,
        name: "Name next page 1",
        description: "Description next page 1",
        price: "125.00",
        imageUrl: "https://source.unsplash.com/1600x900/?product",
        quantity: 21877
      }];
      const mockResponseNextPage = new HttpResponse<any>({ body: mockProductsNextPage});
      mockApiServiceComponent.sendGetRequestToUrl.mockImplementationOnce(() => asyncData(mockResponseNextPage));

      // When
      homeComponent.nextPage();
      flushMicrotasks();

      // Then
      expect(homeComponent.products).toEqual(mockProductsNextPage);
      expect(mockApiServiceComponent.sendGetRequestToUrl).toHaveBeenCalledWith(mockApiServiceComponent.next);
    }));

    it('should do nothing when call next page and do not have next products', fakeAsync(() => {
      // Given
      mockApiServiceComponent.next = '';
      const mockResponseNextPage = new HttpResponse<any>({ body: '' });
      mockApiServiceComponent.sendGetRequestToUrl.mockImplementationOnce(() => asyncData(mockResponseNextPage));

      // When
      homeComponent.nextPage();
      flushMicrotasks();

      // Then
      expect(mockApiServiceComponent.sendGetRequestToUrl).not.toHaveBeenCalled();
    }));

    it('should do nothing when call next page and next products is undefined', fakeAsync(() => {
      // Given
      mockApiServiceComponent.next = undefined;
      const mockResponseNextPage = new HttpResponse<any>({ body: '' });
      mockApiServiceComponent.sendGetRequestToUrl.mockImplementationOnce(() => asyncData(mockResponseNextPage));

      // When
      homeComponent.nextPage();
      flushMicrotasks();

      // Then
      expect(mockApiServiceComponent.sendGetRequestToUrl).not.toHaveBeenCalled();
    }));
  });

  it('should populate products when call last page', fakeAsync(() => {
    // Given
    const mockProductsLastPage = [{
      id: 1,
      name: "Name page 1",
      description: "Description page 1",
      price: "75.00",
      imageUrl: "https://source.unsplash.com/1600x900/?product",
      quantity: 56349
    }];
    const mockResponseLastPage = new HttpResponse<any>({ body: mockProductsLastPage });
    mockApiServiceComponent.sendGetRequestToUrl.mockImplementationOnce(() => asyncData(mockResponseLastPage));

    // When
    homeComponent.lastPage();
    flushMicrotasks();

    // Then
    expect(homeComponent.products).toEqual(mockProductsLastPage);
    expect(mockApiServiceComponent.sendGetRequestToUrl).toHaveBeenCalledWith(mockApiServiceComponent.last);
  }));
  
});
