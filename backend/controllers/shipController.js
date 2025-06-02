import axios from 'axios';

const BASE_URL = 'https://rajaongkir.komerce.id/api/v1/destination/domestic-destination';

export const searchDestination = async (req, res) => {
    const { type, search } = req.query;
    if (!type || !search) return res.status(400).json({ message: 'type and search are required' });

    try {
        const response = await axios.get(BASE_URL, {
        params: {
            search,
            limit: 30000,
            offset: 0
        },
        headers: { 'key': process.env.SHIPPING_COST_API_KEY3 }
        });
        const all = response.data.data || [];
        const seen = new Set();
        let result = [];

        if (type === 'province') {
        all.forEach(item => {
            if (item.province_name && !seen.has(item.province_name)) {
            result.push({ id: item.province_name, name: item.province_name });
            seen.add(item.province_name);
            }
        });
        } else if (type === 'city') {
        all.forEach(item => {
            if (item.city_name && !seen.has(item.city_name)) {
            result.push({ id: item.city_name, name: item.city_name });
            seen.add(item.city_name);
            }
        });
        } else if (type === 'district') {
        all.forEach(item => {
            if (item.district_name && !seen.has(item.district_name)) {
            result.push({ id: item.district_name, name: item.district_name });
            seen.add(item.district_name);
            }
        });
        } else if (type === 'subdistrict') {
        all.forEach(item => {
            if (item.subdistrict_name && !seen.has(item.subdistrict_name)) {
            result.push({ id: item.subdistrict_name, name: item.subdistrict_name });
            seen.add(item.subdistrict_name);
            }
        });
        } else if (type === 'zipcode') {
        all.forEach(item => {
            if (item.zip_code && !seen.has(item.zip_code)) {
            result.push({ id: item.zip_code, name: item.zip_code });
            seen.add(item.zip_code);
            }
        });
    }

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch destination', error: err.message });
  }
};

export const getCitiesByProvince = async (req, res) => {
  const { province } = req.query;
  if (!province) return res.status(400).json({ message: 'province is required' });

  try {
    const response = await axios.get(BASE_URL, {
      params: {
        search: province,
        limit: 30000,
        offset: 0
      },
      headers: { 'key': process.env.SHIPPING_COST_API_KEY3 }
    });
    const all = response.data.data || [];

    // Filter unique city, district, subdistrict, zipcode
    const cities = [];
    const districts = [];
    const subdistricts = [];
    const zipcodes = [];
    const seenCity = new Set();
    const seenDistrict = new Set();
    const seenSubdistrict = new Set();
    const seenZipcode = new Set();

    all.forEach(item => {
    if (item.city_name && !seenCity.has(item.city_name)) {
        cities.push({ id: item.city_name, name: item.city_name });
        seenCity.add(item.city_name);
    }
    if (item.district_name && !seenDistrict.has(item.district_name)) {
        districts.push({
        id: item.district_name,
        name: item.district_name,
        city_name: item.city_name // tambahkan relasi ke city
        });
        seenDistrict.add(item.district_name);
    }
    if (item.subdistrict_name && !seenSubdistrict.has(item.subdistrict_name)) {
        subdistricts.push({
        id: item.subdistrict_name,
        name: item.subdistrict_name,
        district_name: item.district_name // tambahkan relasi ke district
        });
        seenSubdistrict.add(item.subdistrict_name);
    }
    if (item.zip_code && !seenZipcode.has(item.zip_code)) {
        zipcodes.push({
        id: item.zip_code,
        name: item.zip_code,
        subdistrict_name: item.subdistrict_name // tambahkan relasi ke subdistrict
        });
        seenZipcode.add(item.zip_code);
    }
    });

    res.json({ cities, districts, subdistricts, zipcodes });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch cities', error: err.message });
  }
};

export const calculateOngkir = async (req, res) => {
  try {
    const { origin, destination, weight, courier, price } = req.query;
    // Debug log
    console.log('Proxy Ongkir Params:', { origin, destination, weight, courier, price });
    const response = await axios.post(
      'https://rajaongkir.komerce.id/api/v1/calculate/domestic-cost',
      {},
      {
        params: { origin, destination, weight, courier, price },
        headers: { key: process.env.SHIPPING_COST_API_KEY3 }
      }
    );
    // Debug log
    console.log('Proxy Ongkir Response:', response.data.data);
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch ongkir', error: err.message });
  }
};