'use strict';
const log = require('../utils/log');
const util = require('../utils/util');
const CONST = require('../values/constants');
const ERROR = require('../values/error');
const mongo = require('../utils/mongo-util');

function doCreateOrUpdate(req) {
    log.req(req);
    // validate
    var form = util.copy(req.body, ["unid", "name", "firstName", "middleName", "lastName", "address", "phoneNum",
        "familyId", "age", "gender", "race", "nationality", "disabled", "lastContactTime", "lastContactLocation"]);
    form.lastModify = new Date();
    if (form.unid) {
        form.unid = form.unid.toLowerCase().trim();
    }
    log.v('form is ', form);
    return mongo.get({
        unid: form.unid,
    }, CONST.COLLECTION_REFUGEE).spread(function (request) {
        if (request) {
            form._id = request._id;
        }
        return mongo.put(form, CONST.COLLECTION_REFUGEE);
    });
}

exports.create = function (req, res) {
    doCreateOrUpdate(req).then(function (result) {
        ERROR.render(res, '');
    });
};

exports.createApi = function (req, res) {
    doCreateOrUpdate(req).then(function (result) {
        ERROR.ok(res, result);
    });
};

function doList(req) {
    log.req(req);
    var form = util.copy(req.body, ["unid", "name", "firstName", "middleName", "lastName", "address", "phoneNum",
        "familyId", "age", "gender", "race", "nationality", "disabled", "lastContactTime", "lastContactLocation"]);
    var where = mongo.toFilter(form);

    return mongo.collection(CONST.COLLECTION_REFUGEE).then(function (collection) {
        var query = collection.find(where).sort({unid: 1});
        if (req.query.page) {
            const skip = CONST.PAGE_SIZE * (req.query.page - 1);
            query = query.skip(skip).limit(CONST.PAGE_SIZE);
        }
        query = query.toArrayAsync();
        return query;
    });
}

exports.listApi = function (req, res) {
    doList(req).then(function (result) {
        ERROR.ok(res, result);
    });
};