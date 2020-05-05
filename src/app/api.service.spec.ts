const mockOperators = {
  retry: jest.fn(() => true),
  catchError: jest.fn(() => true),
  tap: jest.fn((param) => true)
};
jest.mock('rxjs/operators', () => (mockOperators));

import { fakeAsync, flushMicrotasks } from '@angular/core/testing';
import { HttpParams, HttpResponse, HttpHeaders, HttpErrorResponse, HttpRequest, HttpEventType } from '@angular/common/http';

import { of } from 'rxjs';
import { ApiService } from './api.service';

describe('ApiService', () => {
  let apiService: ApiService;
  let mockHttpClient;
  const provide = (mock: any): any => mock;
  const mockLinkHeader = { 
    Link: '<http://localhost:3000/products?_page=1&_limit=4>; rel="first", <http://localhost:3000/products?_page=1&_limit=4>; rel="prev", <http://localhost:3000/products?_page=3&_limit=4>; rel="next", <http://localhost:3000/products?_page=75&_limit=4>; rel="last"'
  };
  const mockProduts = [{
    id: 1,
    name: "Name",
    description: "Description",
    price: "75.00",
    imageUrl: "https://source.unsplash.com/1600x900/?product",
    quantity: 56349
  }];

  function asyncData<T>(data: T) {
    return of(data);
  }

  function asyncError<T>(errorObject: any) {
    return of(Promise.reject(errorObject));
    // return defer(() => Promise.reject(errorObject));
  }

  beforeEach(() => {
    jest.clearAllMocks();

    mockHttpClient = {
      get: jest.fn()
    };

    apiService = new ApiService(provide(mockHttpClient));
    
  });

  it('should be created', () => {
    expect(apiService).toBeTruthy();
  });

  describe('test for parseLinkHeader function', () => {
    it('should fill all attributes correctly', () => {
      // Given
      const firstExpected = 'http://localhost:3000/products?_page=1&_limit=4';
      const prevExpected = 'http://localhost:3000/products?_page=1&_limit=4';
      const nextExpected = 'http://localhost:3000/products?_page=3&_limit=4';
      const lastExpected = 'http://localhost:3000/products?_page=75&_limit=4';
      
      // When
      apiService.parseLinkHeader(mockLinkHeader.Link);
  
      // Then
      expect(apiService.first).toEqual(firstExpected);
      expect(apiService.prev).toEqual(prevExpected);
      expect(apiService.next).toEqual(nextExpected);
      expect(apiService.last).toEqual(lastExpected);
    });

    it('should fill attributes correctly without prev page', () => {
      // Given
      const mockHeaderNoPrev = '<http://localhost:3000/products?_page=1&_limit=4>; rel="first", <http://localhost:3000/products?_page=2&_limit=4>; rel="next", <http://localhost:3000/products?_page=75&_limit=4>; rel="last"';
      const firstExpected = 'http://localhost:3000/products?_page=1&_limit=4';
      const nextExpected = 'http://localhost:3000/products?_page=2&_limit=4';
      const lastExpected = 'http://localhost:3000/products?_page=75&_limit=4';
      
      // When
      apiService.parseLinkHeader(mockHeaderNoPrev);
  
      // Then
      expect(apiService.first).toEqual(firstExpected);
      expect(apiService.prev).toBeUndefined();
      expect(apiService.next).toEqual(nextExpected);
      expect(apiService.last).toEqual(lastExpected);
    });

    it('should fill attributes correctly without next page', () => {
      // Given
      const mockHeaderNoNext = '<http://localhost:3000/products?_page=1&_limit=4>; rel="first", <http://localhost:3000/products?_page=74&_limit=4>; rel="prev", <http://localhost:3000/products?_page=75&_limit=4>; rel="last"';
      const firstExpected = 'http://localhost:3000/products?_page=1&_limit=4';
      const prevExpected = 'http://localhost:3000/products?_page=74&_limit=4';
      const lastExpected = 'http://localhost:3000/products?_page=75&_limit=4';
      
      // When
      apiService.parseLinkHeader(mockHeaderNoNext);
  
      // Then
      expect(apiService.first).toEqual(firstExpected);
      expect(apiService.prev).toEqual(prevExpected);
      expect(apiService.next).toBeUndefined();
      expect(apiService.last).toEqual(lastExpected);
    });
  
    it('should do nothing if parameter is empty', () => {
      // Given
      const mockHeader = '';
      
      // When
      apiService.parseLinkHeader(mockHeader);
  
      // Then
      expect(apiService.first.length).toBe(0);
      expect(apiService.prev.length).toBe(0);
      expect(apiService.next.length).toBe(0);
      expect(apiService.last.length).toBe(0);
    });
  });

  describe('test for handleError function', () => {
    it('should fill errorMessage if it is a ErrorEvent', fakeAsync(() => {
      // Given
      let errorMessage;
      const mockAlert = jest.spyOn(window, 'alert').mockImplementation(() => {});
      const mockHttpErrorObject = {
        status: 503,
        message: 'error message with code'
      };
      const errorMessageExpected = 'Error: ' + mockHttpErrorObject.message;

      const mockHttpErrorResponse = new HttpErrorResponse({error: new ErrorEvent('type',mockHttpErrorObject)});

      // When
      apiService.handleError(mockHttpErrorResponse).toPromise().catch(error => {
        errorMessage = error;
      });
      flushMicrotasks();

      // Then
      expect(errorMessageExpected).toEqual(errorMessage);
      expect(mockAlert).toHaveBeenCalledTimes(1);
      expect(mockAlert).toHaveBeenCalledWith(errorMessage);
    }));

    it('should fill errorMessage if it is not a ErrorEvent', fakeAsync(() => {
      // Given
      let errorMessage;
      const mockAlert = jest.spyOn(window, 'alert').mockImplementation(() => {});
      const mockHttpErrorObject = {
        status: 503,
        message: 'error message with code'
      };
      const errorMessageExpected = 'Error Code: ' + mockHttpErrorObject.status + '\nMessage: ' + mockHttpErrorObject.message;    
      const mockHttpErrorResponse = {
        headers: null,
        status: mockHttpErrorObject.status,
        statusText: "Unknown Error",
        url: null,
        ok: false,
        name: "HttpErrorResponse",
        message: mockHttpErrorObject.message,
        error: {},
        type: HttpEventType.Response
      } as HttpErrorResponse;

      // const mockHttpErrorResponse = new HttpErrorResponse({status: mockHttpErrorObject.status, error: new Error(mockHttpErrorObject.message)})
      // const mockHttpErrorResponse = new Error('error message with code') as HttpErrorResponse;

      // When
      apiService.handleError(mockHttpErrorResponse).toPromise().catch(error => {
        errorMessage = error;
      });
      flushMicrotasks();

      // Then
      expect(errorMessageExpected).toEqual(errorMessage);
      expect(mockAlert).toHaveBeenCalledTimes(1);
      expect(mockAlert).toHaveBeenCalledWith(errorMessage);
    }));
  });

  describe('should call first page when call...', () => {
    const mockHttpClientResponse = {
      pipe: jest.fn()
    }
    const mockRes = {headers: {get: jest.fn((param) => (param))}};

    beforeEach(() => {
      // Given
      apiService.parseLinkHeader = jest.fn();
      mockHttpClient.get.mockImplementationOnce(() => mockHttpClientResponse);
    });

    afterEach(() => {
      jest.clearAllMocks();
    })

    it('get() - without observable', () => {  
      // When
      apiService.get();
      mockOperators.tap.mock.calls[0][0](mockRes);
  
      // Then
      expect(mockHttpClient.get).toHaveBeenCalledTimes(1);
      expect(mockHttpClientResponse.pipe).toHaveBeenCalledTimes(1);
      expect(mockHttpClientResponse.pipe).toHaveBeenCalledWith(true, true, true);
  
      expect(mockOperators.retry).toBeCalledTimes(1);
      expect(mockOperators.retry).toBeCalledWith(3);
      expect(mockOperators.catchError).toHaveBeenCalledTimes(1);
      expect(mockOperators.catchError).toBeCalledWith(expect.any(Function));
      expect(mockOperators.tap).toHaveBeenCalledTimes(1);
      expect(mockOperators.tap).toHaveBeenCalledWith(expect.any(Function));
  
      expect(apiService.parseLinkHeader).toHaveBeenCalledTimes(1);
      expect(mockRes.headers.get).toHaveBeenCalledTimes(1);
      expect(mockRes.headers.get).toHaveBeenCalledWith('Link');
    });
  
    it('getRequestToUrl() - without observable', () => {  
      // When
      apiService.sendGetRequestToUrl('');
      mockOperators.tap.mock.calls[0][0](mockRes);
  
      // Then
      expect(mockHttpClient.get).toHaveBeenCalledTimes(1);
      expect(mockHttpClientResponse.pipe).toHaveBeenCalledTimes(1);
      expect(mockHttpClientResponse.pipe).toHaveBeenCalledWith(true, true, true);
  
      expect(mockOperators.retry).toBeCalledTimes(1);
      expect(mockOperators.retry).toBeCalledWith(3);
      expect(mockOperators.catchError).toHaveBeenCalledTimes(1);
      expect(mockOperators.catchError).toBeCalledWith(expect.any(Function));
      expect(mockOperators.tap).toHaveBeenCalledTimes(1);
      expect(mockOperators.tap).toHaveBeenCalledWith(expect.any(Function));
  
      expect(apiService.parseLinkHeader).toHaveBeenCalledTimes(1);
      expect(mockRes.headers.get).toHaveBeenCalledTimes(1);
      expect(mockRes.headers.get).toHaveBeenCalledWith('Link');
    });
  });
});
