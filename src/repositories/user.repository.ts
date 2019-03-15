import {DefaultCrudRepository, ensurePromise} from '@loopback/repository';
import {User} from '../models';
import {UserDataSource} from '../datasources';
import {inject} from '@loopback/core';
import {DataObject, Options} from '@loopback/repository/src/common-types';

export class UserRepository extends DefaultCrudRepository<User, typeof User.prototype.id> {
  constructor(
    @inject('datasources.User') dataSource: UserDataSource,
  ) {
    super(User, dataSource);
  }

  sendEmail(recipient: DataObject<User>) {
    let AWS = require('aws-sdk');
    AWS.config.update({region: 'eu-west-1'});

    let params = {
      Destination: {
        ToAddresses: [recipient.email]
      },
      Message: {
        Body: {
          Html: {
            Charset: 'UTF-8',
            Data: 'HTML_FORMAT_BODY',
          },
        },
        Subject: {
          Charset: 'UTF-8',
          Data: 'Welcome to core-api, please confirm your account.',
        },
      },
      Source: 'no-reply@iothings.fr'
    };

    let sendPromise = new AWS.SES({apiVersion: '2010-12-01'}).sendEmail(params).promise();

    sendPromise.then(
      function(data: {MessageId: any;}) {
        console.log('Mail well sent');
        //console.log(data.MessageId);
      }).catch(
      function(parameters: {err: any;}) {
        let err = parameters.err;
        console.error('Error when sending mail', err);
        //console.error(err, err.stack);
      });
  }

  async create(entity: DataObject<User>, options?: Options): Promise<User> {
    let crypto = require('crypto');
    entity.activationKey = crypto.randomBytes(30).toString('hex');
    entity.active = false;
    entity.lastAccess = Math.floor(Date.now() / 1000);

    // https://github.com/awsdocs/aws-doc-sdk-examples/blob/master/javascript/example_code/sns/sns_publishsms.js
    // https://github.com/awsdocs/aws-doc-sdk-examples/blob/master/javascript/example_code/ses/ses_sendemail.js
    // https://github.com/awsdocs/aws-doc-sdk-examples/blob/master/javascript/example_code/ses/ses_sendtemplatedemail.js

    // https://docs.aws.amazon.com/fr_fr/ses/latest/DeveloperGuide/send-personalized-email-api.html
    // https://aws.amazon.com/fr/blogs/messaging-and-targeting/introducing-email-templates-and-bulk-sending/
    // https://medium.com/@yashoda.charith10/sending-emails-using-aws-ses-nodejs-460b8cc6d0d5
    this.sendEmail(entity);

    const model = await ensurePromise(this.modelClass.create(entity, options));
    return this.toEntity(model);
  }
}
