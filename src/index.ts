import { Chance } from 'chance';

import { BasicAuthenticationCredentials } from './shared/http-client';
import { Rally, RallyClient } from './rally/rally-client';

require('dotenv').config();

const rallyUser: string = process.env.RALLY_USERNAME!;
const rallyPass: string = process.env.RALLY_PASSWORD!;

interface SystemOpts {
    credentials: BasicAuthenticationCredentials;
    domain: string;
  }

const chance = new Chance();
export const createRallyFeature = async (
    opts: SystemOpts,
    subscriptionAdmin: BasicAuthenticationCredentials,
    workspaceId: number,
    projectId: number
  ) => {
    const subClient = new RallyClient(subscriptionAdmin, opts.domain);
  
    const feature = await subClient
      .post<Rally.CreateResult<Rally.Feature>>({
        endpoint: '/portfolioitem/feature/create',
        body: {
          feature: {
            name: chance.sentence({ words: 3 }),
            workspace: `workspace/${workspaceId}`,
            project: `project/${projectId}`,
            state: 'Developing',
          },
        },
      })
      .then((res) => res.parsedBody?.CreateResult.Object);
  
    if (!feature) {
      throw new Error('Unable to create feature');
    }
  
    return { feature };
  }

  let creds: SystemOpts['credentials'] = {
    username: rallyUser, 
    password: rallyPass  
}

let opts: SystemOpts = {
    credentials: creds,
    domain: 'https://rally1.rallydev.com'
}

let workspaceOid: number = 12352608129
let projectOid: number   =  14018981482 
//createRallyFeature(opts, creds, workspaceOid, projectOid).then(f => console.log(f.feature.Name, f.feature.FormattedID))

//var params = {query: '(Project.Name = "ProjecTRE")', pagesize : '2000' }

const rallyClient = new RallyClient(creds, opts.domain);
//rallyClient.get<any>({endpoint: 'hierarchicalrequirement', params: params}).then(response => console.log(JSON.stringify(response.parsedBody)))

var queryParams = {query:'(Name = "Wombat")'}
rallyClient.get<any>({endpoint: 'projects', params: queryParams}).then(response => console.log(JSON.stringify(response.parsedBody)))