import React from 'react';
import { useT } from '../i18n/context.jsx';

const LogisticsPreferences = ({
  gender, setGender,
  palette, setPalette,
  packingStrategy, setPackingStrategy,
  laundryCycle, setLaundryCycle,
  techPorts, setTechPorts
}) => {
  const { t } = useT();
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <label htmlFor="gender" style={{ fontSize: '0.875rem', fontWeight: '500', color: 'var(--text-secondary)' }}>{t('preferences.style')}</label>
        <select id="gender" value={gender} onChange={(e) => setGender(e.target.value)}>
          <option value="male">{t('preferences.styleMenswear')}</option>
          <option value="female">{t('preferences.styleWomenswear')}</option>
          <option value="other">{t('preferences.styleNeutral')}</option>
        </select>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <label htmlFor="palette" style={{ fontSize: '0.875rem', fontWeight: '500', color: 'var(--text-secondary)' }}>{t('preferences.archetype')}</label>
        <select id="palette" value={palette} onChange={(e) => setPalette(e.target.value)}>
          <option value="quiet-luxury">{t('preferences.paletteQuietLuxury')}</option>
          <option value="gorpcore">{t('preferences.paletteGorpcore')}</option>
          <option value="scandi">{t('preferences.paletteScandi')}</option>
          <option value="streetwear">{t('preferences.paletteStreetwear')}</option>
          <option value="dark-academia">{t('preferences.paletteDarkAcademia')}</option>
          <option value="athleisure">{t('preferences.paletteAthleisure')}</option>
          <option value="bohemian">{t('preferences.paletteBohemian')}</option>
          <option value="preppy">{t('preferences.palettePreppy')}</option>
          <option value="rock">{t('preferences.paletteRock')}</option>
          <option value="whimsigoth">{t('preferences.paletteWhimsigoth')}</option>
          <option value="coastal">{t('preferences.paletteCoastal')}</option>
          <option value="cottagecore">{t('preferences.paletteCottagecore')}</option>
        </select>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <label htmlFor="strategy" style={{ fontSize: '0.875rem', fontWeight: '500', color: 'var(--text-secondary)' }}>{t('preferences.strategy')}</label>
        <select id="strategy" value={packingStrategy} onChange={(e) => setPackingStrategy(e.target.value)}>
          <option value="standard">{t('preferences.strategyStandard')}</option>
          <option value="flexible">{t('preferences.strategyFlexible')}</option>
          <option value="minimalist">{t('preferences.strategyMinimalist')}</option>
        </select>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <label htmlFor="laundry" style={{ fontSize: '0.875rem', fontWeight: '500', color: 'var(--text-secondary)' }}>{t('preferences.laundry')}</label>
        <select id="laundry" value={laundryCycle} onChange={(e) => setLaundryCycle(parseInt(e.target.value))}>
          <option value={3}>{t('preferences.laundry3')}</option>
          <option value={5}>{t('preferences.laundry5')}</option>
          <option value={7}>{t('preferences.laundry7')}</option>
          <option value={10}>{t('preferences.laundry10')}</option>
          <option value={14}>{t('preferences.laundry14')}</option>
          <option value={999}>{t('preferences.laundryNone')}</option>
        </select>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <label htmlFor="ports" style={{ fontSize: '0.875rem', fontWeight: '500', color: 'var(--text-secondary)' }}>{t('preferences.tech')}</label>
        <select id="ports" value={techPorts} onChange={(e) => setTechPorts(e.target.value)}>
          <option value="mixed">{t('preferences.techMixed')}</option>
          <option value="usbc">{t('preferences.techUsbc')}</option>
        </select>
      </div>
    </div>
  );
};

export default LogisticsPreferences;
