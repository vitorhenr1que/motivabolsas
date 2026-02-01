'use client'
import { ReactEventHandler, useEffect, useState } from 'react';
import styles from './style.module.scss'
import ReactInputMask from 'react-input-mask';
import { UFSelect } from '../UFSelect';
import { CitySelect } from '../CitySelect';

interface AddressProps {
  bairro: string;
  cep: string;
  complemento: string;
  ddd: string;
  estado: string;
  gia: string;
  ibge: string;
  localidade: string;
  logradouro: string;
  regiao: string;
  siafi: string;
  uf: string;
  unidade: string;
}
type AddressType = null | AddressProps
import { PiMapPinBold } from 'react-icons/pi';

function AddressLookup() {
  const [cep, setCep] = useState('');
  const [address, setAddress] = useState<AddressType>(null);

  const fetchAddress = async () => {
    const rawCep = cep.replace(/\D/g, '');
    if (rawCep.length === 8) {
      try {
        const response = await fetch(`https://viacep.com.br/ws/${rawCep}/json/`);
        const data = await response.json();
        if (data.erro) {
          setAddress(null);
          return;
        }
        setAddress(data);
      } catch (error) {
        setAddress(null);
      }
    }
  };

  useEffect(() => {
    const rawCep = cep.replace(/\D/g, '');
    if (rawCep.length < 8) {
      setAddress(null);
    }
  }, [cep]);

  return (
    <div className={styles.container}>
      <div className={styles.inputContainer}>
        <label htmlFor="cep">CEP</label>
        <div className={styles.divInput}>
          <PiMapPinBold className={styles.inputIcon} />
          <ReactInputMask
            mask="99999-999"
            maskChar={null}
            value={cep}
            onChange={(e) => setCep(e.target.value)}
            onBlur={fetchAddress}
          >
            {(inputProps: any) => (
              <input
                {...inputProps}
                id="cep"
                name="cep"
                type="text"
                placeholder="00000-000"
                required={true}
              />
            )}
          </ReactInputMask>
        </div>
      </div>
      <UFSelect cepUf={address?.uf} />
      <CitySelect cepCity={address?.localidade} />
    </div>
  );
}

export default AddressLookup;