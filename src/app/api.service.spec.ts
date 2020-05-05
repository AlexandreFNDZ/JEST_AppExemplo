import { fakeAsync, flushMicrotasks } from '@angular/core/testing';
import { HttpParams, HttpResponse, HttpHeaders, HttpErrorResponse, HttpRequest, HttpEventType } from '@angular/common/http';

import { of } from 'rxjs';
import { ApiService } from './api.service';

// jest.mock('rxjs/operators', () => {
//   return jest.fn().mockImplementation(() => {
//     return {
//       retry: jest.fn(),
//       catchError: jest.fn(),
//       tap: jest.fn()
//     };
//   });
// });

// const mockRetry = jest.spyOn(mockOperators, 'retry').mockImplementation(() => jest.fn());
// const mockCatchError = jest.spyOn(mockOperators, 'catchError').mockImplementation(() => jest.fn());
// const mockTap = jest.spyOn(mockOperators, 'tap').mockImplementation(() => jest.fn());

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
    jest.resetAllMocks();

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

  it('should receive first page of products when call Get', fakeAsync(() => {
    // Given
    let bodyResponseResult;
    const mockServerUrl = "http://localhost:3000/products";
    const mockOptionsParam = { 
      params: new HttpParams({ fromString: "_page=1&_limit=4" }), 
      observe: "response" 
    };
    const mockHeader = new HttpHeaders(mockLinkHeader);
    const mockHttpResponse = new HttpResponse<any>({ body: mockProduts, headers: mockHeader });
    mockHttpClient.get.mockImplementationOnce(() => asyncData(mockHttpResponse));

    // When
    apiService.get().subscribe((data) => {
      bodyResponseResult = data.body;
    });
    flushMicrotasks();

    // Then
    expect(mockHttpClient.get).toHaveBeenCalledWith(mockServerUrl, mockOptionsParam);
    expect(bodyResponseResult).toEqual(mockProduts);
  }));




  it('should receive first page of products when call Get without observable', () => {
    // Given
    const mockHttpClientResponse = {
      pipe: jest.fn()
    }
    const parseLinkSpy = jest.spyOn(apiService, 'parseLinkHeader');
    mockHttpClient.get.mockImplementationOnce(() => mockHttpClientResponse);

    // When
    apiService.get();
    console.log( mockHttpClientResponse.pipe.mock.calls[0][0] );

    // Then
    expect(mockHttpClient.get).toHaveBeenCalled();
    expect(mockHttpClientResponse.pipe).toHaveBeenCalled();
    expect(mockHttpClientResponse.pipe).toHaveBeenCalledWith(expect.any(Function), expect.any(Function), expect.any(Function));
    // expect(parseLinkSpy).toHaveBeenCalled();
  });




  it('should receive first page of products when call GetRequestUrl', fakeAsync(() => {
    // Given
    let responseResult;
    const mockServerUrl = "http://localhost:3000/products?_page=1&_limit=4";
    const mockOptionsParam = {  
      observe: "response" 
    };
    const mockHeader = new HttpHeaders(mockLinkHeader);
    const mockHttpResponse = new HttpResponse<any>({ body: mockProduts, headers: mockHeader });
    mockHttpClient.get.mockImplementationOnce(() => asyncData(mockHttpResponse));
    const parseLinkSpy = jest.spyOn(apiService, 'parseLinkHeader');

    // When
    apiService.sendGetRequestToUrl(mockServerUrl).subscribe((data) => {
      responseResult = data;
    });
    flushMicrotasks();

    // Then
    expect(mockHttpClient.get).toHaveBeenCalledWith(mockServerUrl, mockOptionsParam);
    expect(responseResult.body).toEqual(mockProduts);
    expect(parseLinkSpy).toHaveBeenCalledTimes(1);
    expect(parseLinkSpy).toHaveBeenCalledWith(responseResult.headers.get('Link'));
  }));
});
