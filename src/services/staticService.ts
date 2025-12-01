import mongoose from 'mongoose';
import Country, { ICountry } from '../models/Country';
import State, { IState } from '../models/State';
import City, { ICity } from '../models/City';

// Country interfaces
export interface CreateCountryData {
  name: string;
  code: string;
  phoneCode?: string;
  isActive?: boolean;
}

export interface UpdateCountryData {
  name?: string;
  code?: string;
  phoneCode?: string;
  isActive?: boolean;
}

export interface GetCountriesFilters {
  isActive?: boolean;
  search?: string;
}

// State interfaces
export interface CreateStateData {
  name: string;
  code?: string;
  countryId: string;
  isActive?: boolean;
}

export interface UpdateStateData {
  name?: string;
  code?: string;
  countryId?: string;
  isActive?: boolean;
}

export interface GetStatesFilters {
  countryId?: string;
  isActive?: boolean;
  search?: string;
}

// City interfaces
export interface CreateCityData {
  name: string;
  stateId: string;
  isActive?: boolean;
}

export interface UpdateCityData {
  name?: string;
  stateId?: string;
  isActive?: boolean;
}

export interface GetCitiesFilters {
  stateId?: string;
  isActive?: boolean;
  search?: string;
}

export interface PaginationOptions {
  page: number;
  limit: number;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

class StaticService {
  // ==================== COUNTRY METHODS ====================

  /**
   * Create a new country
   */
  async createCountry(countryData: CreateCountryData): Promise<ICountry> {
    const country = new Country(countryData);
    await country.save();
    return country;
  }

  /**
   * Create multiple countries
   */
  async createCountries(countriesData: CreateCountryData[]): Promise<ICountry[]> {
    const countries = await Country.insertMany(countriesData, { ordered: false });
    return countries;
  }

  /**
   * Get country by ID
   */
  async getCountryById(id: string): Promise<ICountry> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const error: any = new Error('Invalid country ID');
      error.statusCode = 400;
      throw error;
    }

    const country = await Country.findById(id);
    if (!country) {
      const error: any = new Error('Country not found');
      error.statusCode = 404;
      throw error;
    }

    return country;
  }

  /**
   * Get all countries with pagination and filtering
   */
  async getCountries(
    filters: GetCountriesFilters = {},
    pagination: PaginationOptions = { page: 1, limit: 100 }
  ): Promise<PaginatedResult<ICountry>> {
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;

    const query: any = {};

    if (filters.isActive !== undefined) {
      query.isActive = filters.isActive;
    }

    if (filters.search) {
      query.$or = [
        { name: { $regex: filters.search, $options: 'i' } },
        { code: { $regex: filters.search, $options: 'i' } },
      ];
    }

    const [countries, total] = await Promise.all([
      Country.find(query).sort({ name: 1 }).skip(skip).limit(limit),
      Country.countDocuments(query),
    ]);

    return {
      data: countries,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Update country by ID
   */
  async updateCountry(id: string, updateData: UpdateCountryData): Promise<ICountry> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const error: any = new Error('Invalid country ID');
      error.statusCode = 400;
      throw error;
    }

    const country = await Country.findById(id);
    if (!country) {
      const error: any = new Error('Country not found');
      error.statusCode = 404;
      throw error;
    }

    Object.assign(country, updateData);
    await country.save();

    return country;
  }

  /**
   * Delete country by ID
   */
  async deleteCountry(id: string): Promise<void> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const error: any = new Error('Invalid country ID');
      error.statusCode = 400;
      throw error;
    }

    // Check if country has states
    const stateCount = await State.countDocuments({ countryId: id });
    if (stateCount > 0) {
      const error: any = new Error('Cannot delete country with associated states');
      error.statusCode = 400;
      throw error;
    }

    const country = await Country.findByIdAndDelete(id);
    if (!country) {
      const error: any = new Error('Country not found');
      error.statusCode = 404;
      throw error;
    }
  }

  // ==================== STATE METHODS ====================

  /**
   * Create a new state
   */
  async createState(stateData: CreateStateData): Promise<IState> {
    if (!mongoose.Types.ObjectId.isValid(stateData.countryId)) {
      const error: any = new Error('Invalid country ID');
      error.statusCode = 400;
      throw error;
    }

    // Verify country exists
    const country = await Country.findById(stateData.countryId);
    if (!country) {
      const error: any = new Error('Country not found');
      error.statusCode = 404;
      throw error;
    }

    const state = new State(stateData);
    await state.save();
    return state.populate('countryId', 'name code');
  }

  /**
   * Create multiple states
   */
  async createStates(statesData: CreateStateData[]): Promise<IState[]> {
    // Validate all country IDs first
    const countryIds = [...new Set(statesData.map(s => s.countryId))];
    const countries = await Country.find({ _id: { $in: countryIds } });
    const foundCountryIds = new Set(
      countries.map(c => (c._id as { toString: () => string }).toString())
    );

    // Check if all country IDs are valid
    for (const countryId of countryIds) {
      if (!mongoose.Types.ObjectId.isValid(countryId)) {
        const error: any = new Error(`Invalid country ID: ${countryId}`);
        error.statusCode = 400;
        throw error;
      }
      if (!foundCountryIds.has(countryId)) {
        const error: any = new Error(`Country not found: ${countryId}`);
        error.statusCode = 404;
        throw error;
      }
    }

    const states = await State.insertMany(statesData, { ordered: false });
    return State.find({ _id: { $in: states.map(s => s._id) } }).populate('countryId', 'name code');
  }

  /**
   * Get state by ID
   */
  async getStateById(id: string): Promise<IState> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const error: any = new Error('Invalid state ID');
      error.statusCode = 400;
      throw error;
    }

    const state = await State.findById(id).populate('countryId', 'name code');
    if (!state) {
      const error: any = new Error('State not found');
      error.statusCode = 404;
      throw error;
    }

    return state;
  }

  /**
   * Get all states with pagination and filtering
   */
  async getStates(
    filters: GetStatesFilters = {},
    pagination: PaginationOptions = { page: 1, limit: 100 }
  ): Promise<PaginatedResult<IState>> {
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;

    const query: any = {};

    if (filters.countryId) {
      if (!mongoose.Types.ObjectId.isValid(filters.countryId)) {
        const error: any = new Error('Invalid country ID');
        error.statusCode = 400;
        throw error;
      }
      query.countryId = filters.countryId;
    }

    if (filters.isActive !== undefined) {
      query.isActive = filters.isActive;
    }

    if (filters.search) {
      query.$or = [
        { name: { $regex: filters.search, $options: 'i' } },
        { code: { $regex: filters.search, $options: 'i' } },
      ];
    }

    const [states, total] = await Promise.all([
      State.find(query)
        .populate('countryId', 'name code')
        .sort({ name: 1 })
        .skip(skip)
        .limit(limit),
      State.countDocuments(query),
    ]);

    return {
      data: states,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Update state by ID
   */
  async updateState(id: string, updateData: UpdateStateData): Promise<IState> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const error: any = new Error('Invalid state ID');
      error.statusCode = 400;
      throw error;
    }

    const state = await State.findById(id);
    if (!state) {
      const error: any = new Error('State not found');
      error.statusCode = 404;
      throw error;
    }

    // If countryId is being updated, verify it exists
    if (updateData.countryId) {
      if (!mongoose.Types.ObjectId.isValid(updateData.countryId)) {
        const error: any = new Error('Invalid country ID');
        error.statusCode = 400;
        throw error;
      }

      const country = await Country.findById(updateData.countryId);
      if (!country) {
        const error: any = new Error('Country not found');
        error.statusCode = 404;
        throw error;
      }
    }

    Object.assign(state, updateData);
    await state.save();

    return state.populate('countryId', 'name code');
  }

  /**
   * Delete state by ID
   */
  async deleteState(id: string): Promise<void> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const error: any = new Error('Invalid state ID');
      error.statusCode = 400;
      throw error;
    }

    // Check if state has cities
    const cityCount = await City.countDocuments({ stateId: id });
    if (cityCount > 0) {
      const error: any = new Error('Cannot delete state with associated cities');
      error.statusCode = 400;
      throw error;
    }

    const state = await State.findByIdAndDelete(id);
    if (!state) {
      const error: any = new Error('State not found');
      error.statusCode = 404;
      throw error;
    }
  }

  // ==================== CITY METHODS ====================

  /**
   * Create a new city
   */
  async createCity(cityData: CreateCityData): Promise<ICity> {
    if (!mongoose.Types.ObjectId.isValid(cityData.stateId)) {
      const error: any = new Error('Invalid state ID');
      error.statusCode = 400;
      throw error;
    }

    // Verify state exists
    const state = await State.findById(cityData.stateId);
    if (!state) {
      const error: any = new Error('State not found');
      error.statusCode = 404;
      throw error;
    }

    const city = new City(cityData);
    await city.save();
    return city.populate({
      path: 'stateId',
      select: 'name code',
      populate: {
        path: 'countryId',
        select: 'name code',
      },
    });
  }

  /**
   * Create multiple cities
   */
  async createCities(citiesData: CreateCityData[]): Promise<ICity[]> {
    // Validate all state IDs first
    const stateIds = [...new Set(citiesData.map(c => c.stateId))];
    const states = await State.find({ _id: { $in: stateIds } });
    const foundStateIds = new Set(
      states.map(s => (s._id as { toString: () => string }).toString())
    );

    // Check if all state IDs are valid
    for (const stateId of stateIds) {
      if (!mongoose.Types.ObjectId.isValid(stateId)) {
        const error: any = new Error(`Invalid state ID: ${stateId}`);
        error.statusCode = 400;
        throw error;
      }
      if (!foundStateIds.has(stateId)) {
        const error: any = new Error(`State not found: ${stateId}`);
        error.statusCode = 404;
        throw error;
      }
    }

    const cities = await City.insertMany(citiesData, { ordered: false });
    return City.find({ _id: { $in: cities.map(c => c._id) } }).populate({
      path: 'stateId',
      select: 'name code',
      populate: {
        path: 'countryId',
        select: 'name code',
      },
    });
  }

  /**
   * Get city by ID
   */
  async getCityById(id: string): Promise<ICity> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const error: any = new Error('Invalid city ID');
      error.statusCode = 400;
      throw error;
    }

    const city = await City.findById(id).populate({
      path: 'stateId',
      select: 'name code',
      populate: {
        path: 'countryId',
        select: 'name code',
      },
    });
    if (!city) {
      const error: any = new Error('City not found');
      error.statusCode = 404;
      throw error;
    }

    return city;
  }

  /**
   * Get all cities with pagination and filtering
   */
  async getCities(
    filters: GetCitiesFilters = {},
    pagination: PaginationOptions = { page: 1, limit: 100 }
  ): Promise<PaginatedResult<ICity>> {
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;

    const query: any = {};

    if (filters.stateId) {
      if (!mongoose.Types.ObjectId.isValid(filters.stateId)) {
        const error: any = new Error('Invalid state ID');
        error.statusCode = 400;
        throw error;
      }
      query.stateId = filters.stateId;
    }

    if (filters.isActive !== undefined) {
      query.isActive = filters.isActive;
    }

    if (filters.search) {
      query.name = { $regex: filters.search, $options: 'i' };
    }

    const [cities, total] = await Promise.all([
      City.find(query)
        .populate({
          path: 'stateId',
          select: 'name code',
          populate: {
            path: 'countryId',
            select: 'name code',
          },
        })
        .sort({ name: 1 })
        .skip(skip)
        .limit(limit),
      City.countDocuments(query),
    ]);

    return {
      data: cities,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Update city by ID
   */
  async updateCity(id: string, updateData: UpdateCityData): Promise<ICity> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const error: any = new Error('Invalid city ID');
      error.statusCode = 400;
      throw error;
    }

    const city = await City.findById(id);
    if (!city) {
      const error: any = new Error('City not found');
      error.statusCode = 404;
      throw error;
    }

    // If stateId is being updated, verify it exists
    if (updateData.stateId) {
      if (!mongoose.Types.ObjectId.isValid(updateData.stateId)) {
        const error: any = new Error('Invalid state ID');
        error.statusCode = 400;
        throw error;
      }

      const state = await State.findById(updateData.stateId);
      if (!state) {
        const error: any = new Error('State not found');
        error.statusCode = 404;
        throw error;
      }
    }

    Object.assign(city, updateData);
    await city.save();

    return city.populate({
      path: 'stateId',
      select: 'name code',
      populate: {
        path: 'countryId',
        select: 'name code',
      },
    });
  }

  /**
   * Delete city by ID
   */
  async deleteCity(id: string): Promise<void> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const error: any = new Error('Invalid city ID');
      error.statusCode = 400;
      throw error;
    }

    const city = await City.findByIdAndDelete(id);
    if (!city) {
      const error: any = new Error('City not found');
      error.statusCode = 404;
      throw error;
    }
  }
}

export default new StaticService();
