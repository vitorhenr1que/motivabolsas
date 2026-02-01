'use client'
import { useEffect, useState } from 'react';
import styles from './style.module.scss'
import { City, useUser } from '../../contexts/user-provider';
interface cepUfProps {
  cepCity?: string
}
import { PiBuildingsBold, PiCaretDownBold } from 'react-icons/pi';

export function CitySelect({ cepCity }: cepUfProps) {
  const [selectedCity, setSelectedCity] = useState('');
  const { city } = useUser()
  // Lista de siglas de estados do Brasil
  // useEffect(() => {
  //   console.log(city)
  // }, [city])

  return (
    <div className={styles.inputContainer}>
      <label htmlFor="city">Cidade</label>
      <div className={styles.selectWrapper}>
        <PiBuildingsBold className={styles.inputIcon} />
        <select
          id="city"
          name="city"
          className={cepCity ? styles.cepCity : styles.select}
          value={cepCity || selectedCity}
          onChange={(e) => setSelectedCity(e.target.value)}
          required
        >
          {cepCity ? (
            <option value={cepCity}>{cepCity}</option>
          ) : (
            <>
              <option value="" disabled selected>Selecione a cidade</option>
              {city?.map((item) => (
                <option key={item.id} value={item.nome}>{item.nome}</option>
              ))}
            </>
          )}
        </select>
        <PiCaretDownBold className={styles.chevronIcon} />
      </div>

    </div>
  );
}