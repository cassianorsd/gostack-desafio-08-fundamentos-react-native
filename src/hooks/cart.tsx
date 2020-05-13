import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      try {
        const items = await AsyncStorage.getItem('@GoMarketplace:products');
        if (items) {
          setProducts(JSON.parse(items));
        }
      } catch (err) {
        console.log(err);
      }
      // TODO LOAD ITEMS FROM ASYNC STORAGE
    }

    loadProducts();
  }, []);

  useEffect(() => {
    async function storeProducts(): Promise<void> {
      try {
        await AsyncStorage.setItem(
          '@GoMarketplace:products',
          JSON.stringify(products),
        );
      } catch (err) {
        console.log(err);
      }
    }
    storeProducts();
  }, [products]);

  const addToCart = useCallback(async (product: Omit<Product, 'quantity'>) => {
    setProducts(oldCart => [...oldCart, { ...product, quantity: 1 }]);
  }, []);

  const increment = useCallback(async id => {
    setProducts(items =>
      items.map(product => {
        if (product.id === id)
          return { ...product, quantity: product.quantity + 1 };
        return { ...product };
      }),
    );
    // await AsyncStorage.setItem(
    //   '@GoMarketplace:products',
    //   JSON.stringify(newProds),
    // );
  }, []);

  const decrement = useCallback(async id => {
    setProducts(items =>
      items.map(item => {
        if (item.id === id)
          return {
            ...item,
            quantity: item.quantity === 1 ? 0 : item.quantity - 1,
          };
        return item;
      }),
    );
  }, []);

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
