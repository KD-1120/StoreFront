declare module './demoStoreData.json' {
  interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
    image: string;
    category: string;
  }

  interface DemoStoreData {
    storeName: string;
    products: Product[];
    categories: string[];
  }

  const value: DemoStoreData;
  export default value;
}
