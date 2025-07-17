
"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Animal } from '@/lib/types';

interface AnimalsContextType {
  animals: Animal[];
  addAnimal: (animal: Omit<Animal, 'id'>) => Animal;
  updateAnimal: (animal: Animal) => void;
  deleteAnimal: (id: string) => void;
  getAnimal: (id: string) => Animal | undefined;
}

const AnimalsContext = createContext<AnimalsContextType | undefined>(undefined);

const initialAnimals: Animal[] = [
    { id: "A001", name: "Daisy", species: "Bovine", age: 24, weight: 650, lot: "L001", status: "Healthy" },
    { id: "A002", name: "Babe", species: "Porcine", age: 6, weight: 100, lot: "L001", status: "At Risk" },
    { id: "A003", name: "Cluck", species: "Poultry", age: 1, weight: 2, lot: "L002", status: "Healthy" },
    { id: "A004", name: "Billy", species: "Caprine", age: 12, weight: 50, lot: "L003", status: "Sold", salePrice: 300 },
    { id: "A005", name: "Peter", species: "Rabbit", age: 4, weight: 3, lot: "L002", status: "Healthy" },
];

export const AnimalsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    try {
      const item = window.localStorage.getItem('animals');
      if (item) {
        setAnimals(JSON.parse(item));
      } else {
        setAnimals(initialAnimals);
      }
    } catch (error) {
      console.error(error);
      setAnimals(initialAnimals);
    }
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (isInitialized) {
      try {
          window.localStorage.setItem('animals', JSON.stringify(animals));
      } catch (error) {
          console.error(error);
      }
    }
  }, [animals, isInitialized]);
  
  const getNextId = useCallback((species: string) => {
    const prefix = "A";
    const lastIdNum = animals.reduce((maxId, animal) => {
        const idNum = parseInt(animal.id.replace(prefix, '') || '0');
        return idNum > maxId ? idNum : maxId;
    }, 0);
    return `${prefix}${String(lastIdNum + 1).padStart(3, '0')}`;
  }, [animals]);
  
  const addAnimal = useCallback((animalData: Omit<Animal, 'id'>) => {
    const newId = (animalData as any).id || getNextId(animalData.species);
    const newAnimal: Animal = {
      ...animalData,
      id: newId,
    };
    setAnimals(prev => [...prev, newAnimal]);
    return newAnimal;
  }, [getNextId, animals]);

  const updateAnimal = useCallback((updatedAnimal: Animal) => {
    setAnimals(prev => prev.map(animal => animal.id === updatedAnimal.id ? updatedAnimal : animal));
  }, []);

  const deleteAnimal = useCallback((id: string) => {
    setAnimals(prev => prev.filter(animal => animal.id !== id));
  }, []);

  const getAnimal = useCallback((id: string) => {
    return animals.find(animal => animal.id === id);
  }, [animals]);

  return (
    <AnimalsContext.Provider value={{ animals, addAnimal, updateAnimal, deleteAnimal, getAnimal }}>
      {children}
    </AnimalsContext.Provider>
  );
};

export const useAnimals = () => {
  const context = useContext(AnimalsContext);
  if (context === undefined) {
    throw new Error('useAnimals must be used within an AnimalsProvider');
  }
  return context;
};
