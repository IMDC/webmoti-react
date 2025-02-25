/* eslint-disable import/first */
// process.env.REACT_APP_FIREBASE_DATABASE_URL = 'mockURL';

import firebaseAuthMiddleware from '../firebaseAuthMiddleware';
import firebaseAdmin from 'firebase-admin';

jest.mock('../../../plugin-rtc/src/firebase_service_account.json', () => ({ mockCertificate: 'foo' }), {
  virtual: true,
});
jest.mock('firebase-admin', () => {
  const mockVerifyIdToken = jest.fn();

  return {
    initializeApp: jest.fn(),
    auth: () => ({
      verifyIdToken: mockVerifyIdToken,
    }),
    credential: {
      cert: jest.fn((cert: any) => cert),
    },
  };
});

const mockRequest: any = { get: jest.fn(() => 'mockToken') };
const mockResponse: any = {
  status: jest.fn(() => mockResponse),
  json: jest.fn(() => mockResponse),
};

const mockNext = jest.fn();

const mockVerifyIdToken = firebaseAdmin.auth().verifyIdToken as jest.Mock<any>;

describe('the firebaseAuthMiddleware function', () => {
  afterEach(jest.clearAllMocks);

  it('should correctly initialize the firebase client', async () => {
    mockVerifyIdToken.mockImplementationOnce(() => Promise.resolve({ email: 'test@foo.com' }));
    await firebaseAuthMiddleware(mockRequest, mockResponse, mockNext);
    expect(firebaseAdmin.initializeApp).toHaveBeenCalledWith({
      credential: { mockCertificate: 'foo' },
      // databaseURL: 'mockURL',
    });
  });

  it('should return a 401 when there is no authorization header', async () => {
    const mockRequestWithoutHeader: any = { get: () => '' };
    await firebaseAuthMiddleware(mockRequestWithoutHeader, mockResponse, mockNext);
    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalled();
  });

  it('should return a 401 when there is an error verifying the token', async () => {
    mockVerifyIdToken.mockImplementationOnce(() => Promise.reject());
    await firebaseAuthMiddleware(mockRequest, mockResponse, mockNext);
    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalled();
  });

  it('should return a 403 when the token does not produce an email address', async () => {
    mockVerifyIdToken.mockImplementationOnce(() => Promise.resolve({}));
    await firebaseAuthMiddleware(mockRequest, mockResponse, mockNext);
    expect(mockResponse.status).toHaveBeenCalledWith(403);
    expect(mockResponse.json).toHaveBeenCalled();
  });

  it("should return a 403 when the user's email address does not have a TMU domain", async () => {
    mockVerifyIdToken.mockImplementationOnce(() => Promise.resolve({ email: 'test@foo.com' }));
    await firebaseAuthMiddleware(mockRequest, mockResponse, mockNext);
    expect(mockResponse.status).toHaveBeenCalledWith(403);
    expect(mockResponse.json).toHaveBeenCalled();
  });

  it("should call next when the user's email address does have a TMU domain", async () => {
    mockVerifyIdToken.mockImplementationOnce(() => Promise.resolve({ email: 'test@torontomu.ca' }));
    await firebaseAuthMiddleware(mockRequest, mockResponse, mockNext);
    expect(mockNext).toHaveBeenCalled();
    expect(mockResponse.json).not.toHaveBeenCalled();
  });

  it('should call verifyIdToken with the authorization header from the request', async () => {
    mockVerifyIdToken.mockImplementationOnce(() => Promise.resolve({ email: 'test@torontomu.ca' }));
    await firebaseAuthMiddleware(mockRequest, mockResponse, mockNext);
    expect(mockRequest.get).toHaveBeenLastCalledWith('authorization');
    expect(mockVerifyIdToken).toHaveBeenCalledWith('mockToken');
  });
});
