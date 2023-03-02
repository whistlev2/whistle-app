import { ReportType } from '../../interfaces/types';
import ReportModel from '../models/report';
import { Schema } from 'mongoose';

async function createReport(report: ReportType) {
    try {
        let ret = await ReportModel.create(report);
        return ret;
    } catch (err) {
        console.error('Error creating report'); //TODO: Handle differently
        console.error(err);
    }
}

async function getReport(reportID: string | Schema.Types.ObjectId) {
    try {
        let ret = await ReportModel.findById(reportID);
        return ret;
    } catch (err) {
        console.error('Error getting report'); //TODO: Handle differently
    }
}

async function updateReport(reportID: string | Schema.Types.ObjectId, updatedReport: ReportType) {
    try {
        let report = await ReportModel.findById(reportID);
        if (report) {
            report.set(updatedReport);
            await report.save();
            return report;
        } else {
            return null;
        }
    } catch (err) {
        console.error(err);
        console.error('Error updating report'); //TODO: Handle differently
        throw err;
    }
}

async function deleteReport(reportID: string) {
    try {
        let report = await ReportModel.findById(reportID);
        if (report) {
            await report.remove();
            return report;
        } else {
            return null;
        }
    } catch (err) {
        console.error('Error deleting report'); //TODO: Handle differently
    }
}

async function addToField(reportID: string | Schema.Types.ObjectId, field: string, value: any) {
    //TODO: Add view to field
    //TODO: handle multiple choice fields
    try {
        let report = await ReportModel.findById(reportID);
        if (report) {
            if (report.fields[field] && report.fields[field].value) {
                report.fields[field].value += ';' + value.toString();
            } else {
                report.fields[field] = {
                    value: value.toString()
                };
            }
            report = await updateReport(reportID, report);
            return report;
        } else {
            throw createError('Could not find report');
        }
    } catch (err) {
        console.error(err);
        throw createError('Could not add field'); //TODO: Handle differently
    }
}

export default {
    createReport,
    getReport,
    updateReport,
    deleteReport,
    addToField
};
