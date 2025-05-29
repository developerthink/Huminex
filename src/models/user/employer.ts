import  { Model, Schema } from 'mongoose';
import User from './user';
import type { EmployerType } from '../../types/models/user/employer';

const EmployerSchema = new Schema<EmployerType>({
  companyDetails: {
    name: { type: String, required: true },
    about: { type: String, required: true },
    website: { type: String, default: "" },
    linkedin: { type: String, default: "" },
    x: { type: String, default: "" },
    logo: { type: String, required: true },
    numberOfEmployees: { type: Number, required: true },
    companyType: { type: String, required: true },
    industryType: { type: String, required: true },
    location: { type: String, required: true },
    tagline: { type: String, required: true },
  }
});

const Employer = (User.discriminators?.['employer'] || User.discriminator<EmployerType>('employer', EmployerSchema)) as Model<EmployerType>;


export default Employer;