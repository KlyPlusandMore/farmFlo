
"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Vehicle } from '@/lib/types';

interface VehiclesContextType {
  vehicles: Vehicle[];
  addVehicle: (vehicle: Omit<Vehicle, 'id'>) => Vehicle;
  updateVehicle: (vehicle: Vehicle) => void;
  deleteVehicle: (id: string) => void;
  getVehicle: (id: string) => Vehicle | undefined;
}

const VehiclesContext = createContext<VehiclesContextType | undefined>(undefined);

const initialVehicles: Vehicle[] = [
    { id: "VIN001", make: "Toyota", model: "Camry", year: 2021, mileage: 50000, location: "Lot A", status: "Available" },
    { id: "VIN002", make: "Honda", model: "Civic", year: 2020, mileage: 65000, location: "Lot A", status: "In Service" },
    { id: "VIN003", make: "Ford", model: "F-150", year: 2022, mileage: 30000, location: "Lot B", status: "Available" },
    { id: "VIN004", make: "BMW", model: "X5", year: 2019, mileage: 80000, location: "Lot C", status: "Sold", salePrice: 35000 },
    { id: "VIN005", make: "Mercedes", model: "C-Class", year: 2023, mileage: 15000, location: "Lot B", status: "Available" },
];

export const VehiclesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    try {
      const item = window.localStorage.getItem('vehicles');
      if (item) {
        setVehicles(JSON.parse(item));
      } else {
        setVehicles(initialVehicles);
      }
    } catch (error) {
      console.error(error);
      setVehicles(initialVehicles);
    }
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (isInitialized) {
      try {
          window.localStorage.setItem('vehicles', JSON.stringify(vehicles));
      } catch (error) {
          console.error(error);
      }
    }
  }, [vehicles, isInitialized]);
  
  const getNextId = useCallback((make: string) => {
    const prefix = "VIN";
    const lastIdNum = vehicles.reduce((maxId, vehicle) => {
        const idNum = parseInt(vehicle.id.replace(prefix, '') || '0');
        return idNum > maxId ? idNum : maxId;
    }, 0);
    return `${prefix}${String(lastIdNum + 1).padStart(3, '0')}`;
  }, [vehicles]);
  
  const addVehicle = useCallback((vehicleData: Omit<Vehicle, 'id'>) => {
    const newId = (vehicleData as any).id || getNextId(vehicleData.make);
    const newVehicle: Vehicle = {
      ...vehicleData,
      id: newId,
    };
    setVehicles(prev => [...prev, newVehicle]);
    return newVehicle;
  }, [getNextId, vehicles]);

  const updateVehicle = useCallback((updatedVehicle: Vehicle) => {
    setVehicles(prev => prev.map(vehicle => vehicle.id === updatedVehicle.id ? updatedVehicle : vehicle));
  }, []);

  const deleteVehicle = useCallback((id: string) => {
    setVehicles(prev => prev.filter(vehicle => vehicle.id !== id));
  }, []);

  const getVehicle = useCallback((id: string) => {
    return vehicles.find(vehicle => vehicle.id === id);
  }, [vehicles]);

  return (
    <VehiclesContext.Provider value={{ vehicles, addVehicle, updateVehicle, deleteVehicle, getVehicle }}>
      {children}
    </VehiclesContext.Provider>
  );
};

export const useVehicles = () => {
  const context = useContext(VehiclesContext);
  if (context === undefined) {
    throw new Error('useVehicles must be used within a VehiclesProvider');
  }
  return context;
};
