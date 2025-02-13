
interface EverflowSDK {
  click: (params: any) => Promise<string>;
  conversion: (params: any) => Promise<{ conversion_id: string }>;
  urlParameter: (param: string) => string | undefined;
}

declare global {
  interface Window {
    EF: EverflowSDK;
  }
}

export {};
