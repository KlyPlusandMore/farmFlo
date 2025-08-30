
"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, DocumentData } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Animal } from '@/lib/types';

interface AnimalsContextType {
  animals: Animal[];
  addAnimal: (animal: Omit<Animal, 'id'|'gender'>) => Promise<void>;
  updateAnimal: (animal: Animal) => Promise<void>;
  deleteAnimal: (id: string) => Promise<void>;
  getAnimal: (id: string) => Animal | undefined;
  loading: boolean;
}

const AnimalsContext = createContext<AnimalsContextType | undefined>(undefined);

const initialAnimals: Animal[] = [
    { id: "A001", name: "Daisy", species: "Bovine", breed: "Holstein", birthDate: "2022-05-20", gender: "Female", weight: 650, lot: "L001", status: "Healthy" },
    { id: "A002", name: "Babe", species: "Porcine", breed: "Yorkshire", birthDate: "2024-01-15", gender: "Male", weight: 100, lot: "L001", status: "At Risk" },
    { id: "A003", name: "Cluck", species: "Poultry", breed: "Leghorn", birthDate: "2023-11-01", gender: "Female", weight: 2, lot: "L002", status: "Healthy", notes: "Good egg layer." },
    { id: "A004", name: "Billy", species: "Caprine", breed: "Boer", birthDate: "2023-05-20", gender: "Male", weight: 50, lot: "L003", status: "Sold", salePrice: 300 },
    { id: "A005", name: "Peter", species: "Rabbit", breed: "New Zealand White", birthDate: "2024-03-10", gender: "Male", weight: 3, lot: "L002", status: "Healthy" },
];

export const AnimalsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Temporarily load initial data to bypass Firestore permission issues
    setAnimals(initialAnimals);
    setLoading(false);

    // The code below connects to Firestore. It is commented out until permissions are fixed.
    /*
    const animalsCollection = collection(db, 'animals');
    
    const unsubscribe = onSnapshot(animalsCollection, (snapshot) => {
        if (snapshot.empty) {
            setAnimals(initialAnimals);
        } else {
            const animalsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Animal));
            setAnimals(animalsData);
        }
        setLoading(false);
    }, (error) => {
        console.error("Error fetching animals from Firestore: ", error);
        // Fallback to initial data on error
        setAnimals(initialAnimals);
        setLoading(false);
    });

    return () => unsubscribe();
    */
  }, []);
  
  const addAnimal = useCallback(async (animalData: Omit<Animal, 'id' | 'gender'>) => {
    try {
        const gender = Math.random() > 0.5 ? "Male" : "Female";
        const newAnimal = { ...animalData, gender, id: crypto.randomUUID() } as Animal;
        setAnimals(prev => [newAnimal, ...prev]);
        // The line below connects to Firestore. It is commented out until permissions are fixed.
        // await addDoc(collection(db, 'animals'), { ...animalData, gender });
    } catch (error) {
        console.error("Error adding animal: ", error);
    }
  }, []);

  const updateAnimal = useCallback(async (updatedAnimal: Animal) => {
    try {
        setAnimals(prev => prev.map(a => a.id === updatedAnimal.id ? updatedAnimal : a));
        // The lines below connect to Firestore. They are commented out until permissions are fixed.
        // const animalDocRef = doc(db, 'animals', updatedAnimal.id);
        // const { id, ...dataToUpdate } = updatedAnimal;
        // await updateDoc(animalDocRef, dataToUpdate as DocumentData);
    } catch (error) {
        console.error("Error updating animal: ", error);
    }
  }, []);

  const deleteAnimal = useCallback(async (id: string) => {
    try {
        setAnimals(prev => prev.filter(a => a.id !== id));
        // The line below connects to Firestore. It is commented out until permissions are fixed.
        // const animalDocRef = doc(db, 'animals', id);
        // await deleteDoc(animalDocRef);
    } catch (error) {
        console.error("Error deleting animal: ", error);
    }
  }, []);

  const getAnimal = useCallback((id: string) => {
    return animals.find(animal => animal.id === id);
  }, [animals]);

  return (
    <AnimalsContext.Provider value={{ animals, addAnimal, updateAnimal, deleteAnimal, getAnimal, loading }}>
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
