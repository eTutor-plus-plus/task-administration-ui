export interface HttpExchanges {
  exchanges: HttpExchange[];
}

export interface HttpExchange {
  timestamp: string;
  principal?: {
    name: string;
  };
  request: HttpExchangeRequest;
  response: HttpExchangeResponse;
  session?: {
    id: string;
  };
  timeTaken: string;
}

export interface HttpExchangeRequest {
  uri: string;
  method: string;
  remoteAddress?: string;
  headers: Record<string, string[]>;
}

export interface HttpExchangeResponse {
  status: number;
  headers: Record<string, string[]>;
}
