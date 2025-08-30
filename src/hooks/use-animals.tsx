
"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, DocumentData, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Animal } from '@/lib/types';
import { useAuth } from './use-auth';

interface AnimalsContextType {
  animals: Animal[];
  addAnimal: (animal: Omit<Animal, 'id' | 'gender' | 'userId'>) => Promise<void>;
  updateAnimal: (animal: Animal) => Promise<void>;
  deleteAnimal: (id: string) => Promise<void>;
  getAnimal: (id: string) => Animal | undefined;
  loading: boolean;
}

const AnimalsContext = createContext<AnimalsContextType | undefined>(undefined);

export const AnimalsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setAnimals([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const animalsCollection = collection(db, 'animals');
    const q = query(animalsCollection, where("userId", "==", user.uid));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
        const animalsData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as Animal));
        setAnimals(animalsData);
        setLoading(false);
    }, (error) => {
        console.error("Error fetching animals from Firestore: ", error);
        setAnimals([]);
        setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);
  
  const addAnimal = useCallback(async (animalData: Omit<Animal, 'id' | 'gender' | 'userId'>) => {
    if (!user) return;
    try {
        const gender = Math.random() > 0.5 ? "Male" : "Female";
        await addDoc(collection(db, 'animals'), { ...animalData, gender, userId: user.uid });
    } catch (error) {
        console.error("Error adding animal: ", error);
    }
  }, [user]);

  const updateAnimal = useCallback(async (updatedAnimal: Animal) => {
    if (!user) return;
    try {
        const animalDocRef = doc(db, 'animals', updatedAnimal.id);
        const { id, ...dataToUpdate } = updatedAnimal;
        await updateDoc(animalDocRef, dataToUpdate as DocumentData);
    } catch (error) {
        console.error("Error updating animal: ", error);
    }
  }, [user]);

  const deleteAnimal = useCallback(async (id: string) => {
    if (!user) return;
    try {
        const animalDocRef = doc(db, 'animals', id);
        await deleteDoc(animalDocRef);
    } catch (error) {
        console.error("Error deleting animal: ", error);
    }
  }, [user]);

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
