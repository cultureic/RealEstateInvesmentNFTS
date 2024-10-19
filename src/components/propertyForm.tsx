//@ts-nocheck
import React, { useState, ChangeEvent, FormEvent } from 'react';
import { TextInput, Textarea, FileInput, Button } from 'flowbite-react';
import { useAuth } from '../hooks/auth';

interface FormValues {
  valueBTC: number;
  picture: Uint8Array | null;
  description: string;
  address: string; // New address field
  rentBTC: number;
}

const MyForm: React.FC = () => {
    const{createProperty} = useAuth();
  const [formValues, setFormValues] = useState<FormValues>({
    valueBTC: 0,
    picture: null,
    description: '',
    address: '', // Initialize the new field
    rentBTC:0
  });

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setFormValues({
      ...formValues,
      [id]: (id === 'valueBTC' || id === "rentBTC")  ? Number(value) : value,
    });
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    if (file) {
      const reader = new FileReader();
      reader.readAsArrayBuffer(file);
      reader.onload = () => {
        const buffer = reader.result as ArrayBuffer;
        setFormValues({
          ...formValues,
          picture: new Uint8Array(buffer),
        });
      };
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    console.log('Submitted data:', formValues);
    createProperty(formValues)
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header for Value BTC */}
      <h1 className="text-xl font-semibold dark:text-white">Enter Bitcoin Value (in Sats)</h1>
      <div>
        <TextInput
          id="valueBTC"
          type="number"
          required
          value={formValues.valueBTC}
          onChange={handleInputChange}
          placeholder="Enter BTC value"
          label="Value BTC (in sats)"
        />
      </div>
      <h1 className="text-xl font-semibold dark:text-white">Enter Rent Bitcoin Value (in Sats)</h1>
      <div>
        <TextInput
          id="rentBTC"
          type="number"
          required
          value={formValues.rentBTC}
          onChange={handleInputChange}
          placeholder="Enter BTC value"
          label="Value BTC (in sats)"
        />
      </div>
      {/* Header for Address */}
      <h1 className="text-xl font-semibold dark:text-white">Enter Address</h1>
      <div>
        <TextInput
          id="address"
          required
          value={formValues.address}
          onChange={handleInputChange}
          placeholder="Enter your address"
          label="Address"
        />
      </div>

      {/* Header for Description */}
      <h1 className="text-xl font-semibold dark:text-white">Enter a Description</h1>
      <div>
        <Textarea
          id="description"
          required
          value={formValues.description}
          onChange={handleInputChange}
          placeholder="Enter a description"
          label="Description"
        />
      </div>

      {/* Header for Picture */}
      <h1 className="text-xl font-semibold dark:text-white">Upload a Picture</h1>
      <div>
        <FileInput
          id="picture"
          accept="image/*"
          onChange={handleFileChange}
          label="Upload a picture"
        />
      </div>

      {/* Submit button */}
      <Button type="submit">Submit</Button>
    </form>
  );
};

export default MyForm;
