
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
  { id: "B-001", name: "Bessie", species: "Bovine", age: 24, weight: 650, lot: "A1", status: "Healthy" },
  { id: "B-002", name: "Angus", species: "Bovine", age: 36, weight: 720, lot: "A1", status: "Healthy" },
  { id: "P-001", name: "Porky", species: "Porcine", age: 6, weight: 110, lot: "B2", status: "Healthy" },
  { id: "P-002", name: "Wilbur", species: "Porcine", age: 7, weight: 125, lot: "B2", status: "Sick" },
  { id: "C-001", name: "Cluck", species: "Poultry", age: 12, weight: 2, lot: "C3", status: "Healthy" },
  { id: "G-001", name: "Billy", species: "Caprine", age: 18, weight: 60, lot: "D4", status: "Sold", salePrice: 150 },
  { id: "R-001", name: "Roger", species: "Rabbit", age: 4, weight: 3, lot: "E5", status: "Healthy" },
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
    const prefix = species.charAt(0).toUpperCase();
    const speciesAnimals = animals.filter(a => a.species === species);
    const lastIdNum = speciesAnimals.reduce((maxId, animal) => {
        const idNum = parseInt(animal.id.split('-')[1] || '0');
        return idNum > maxId ? idNum : maxId;
    }, 0);
    return `${prefix}-${String(lastIdNum + 1).padStart(3, '0')}`;
  }, [animals]);
  
  const addAnimal = useCallback((animalData: Omit<Animal, 'id'>) => {
    const newId = getNextId(animalData.species);
    const newAnimal: Animal = {
      ...animalData,
      id: newId,
    };
    setAnimals(prev => [...prev, newAnimal]);
    return newAnimal;
  }, [getNextId]);

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
