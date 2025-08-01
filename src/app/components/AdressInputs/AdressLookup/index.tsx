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
function AddressLookup() {
  const [cep, setCep] = useState('');
  const [address, setAddress] = useState<AddressType>(null);
  console.log(address)

  const fetchAddress = async () => {
    if (cep.length === 8) { // Apenas busca se o CEP tiver 8 dígitos
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await response.json();
        if(data.erro){
          setAddress(null);
          alert('Não foi possível encontrar o CEP da sua cidade, tente novamente.')
          return console.error('Erro ao buscar o cep: ', cep, '. Tente novamente.');
        }
        setAddress(data);
      } catch (error) {
        setAddress(null);
        alert('Não foi possível encontrar o CEP da sua cidade, tente novamente.')
        return console.error('Erro ao buscar o endereço:', error);
      }
    }
  };

  useEffect(() => {
    if(cep.length < 8){
      setAddress(null)
    }
  }, [cep])

  return (
    <div className={styles.container}>
    <div className={styles.inputContainer}>
      <label htmlFor="cep">CEP: *</label>
      <div className={styles.divInput}>
      <input
        id="cep"
        name="cep"
        type="text"
        value={cep}
        onChange={(e) => setCep(e.target.value.replace(/\D/g, ''))} // Remove caracteres não numéricos
        onBlur={fetchAddress} // Ao clicar fora do botão de input selecionado
        placeholder="XXXXX-XXX"
        maxLength={8}
        required={true}
      />
     </div>
    </div>
    <UFSelect cepUf={address?.uf}/>
    <CitySelect cepCity={address?.localidade}/>
    </div>
  );
}

export default AddressLookup;