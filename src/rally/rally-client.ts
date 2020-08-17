import { RequestInit } from 'node-fetch';

import { Credentials, HttpClient, RequestOpts } from '../shared/http-client';

export class RallyClient extends HttpClient {
    protected apiPath = '/slm/webservice/v2.0';

    private securityToken?: string;

    constructor(credentials: Credentials, rallyUrl: string) {
        //super constructor takes an obj literal as a param, 
        // has to follow interface HttpClientConfig 
        super({ cookies: true, credentials, url: rallyUrl });
      }

    protected async buildRequest(opts: RequestOpts, init: RequestInit) {
        if (init.method && init.method.toLowerCase() !== 'get') {
          const token = await this.getSecurityToken();
          opts.params = Object.assign({ key: token }, opts.params);
        }
    
        return super.buildRequest(opts, init);
    }

    private async getSecurityToken() {
        if (this.securityToken){
            return this.securityToken;
        }

        const res = await this.get<Rally.AuthorizeResponse>({
           endpoint: '/security/authorize'
        });
        this. securityToken = res.parsedBody?.OperationResult.SecurityToken;
        if (!this.securityToken){
            throw new Error('Failed to retrieve security token from Rally')
        }
        return this.securityToken;
    }
}

export namespace Rally{
    export interface AttrubuteDefinition extends WsapiObject{
        _type: 'AttributeDefinition';
        Custom: boolean;
        ElementName: string;
        Name: string;
        RealAttributeType: string;
        TypeDefinition: WsapiObjectRef<'TypeDefinition'>;
    }

    export interface AuthorizeResponse{
        OperationResult: WsapiResult & { SecurityToken: string };
    }

    export interface CreateResult<T> {
        CreateResult: WsapiResult & { Object: T };
      }

    export interface Feature extends WsapiObject {
        _type: 'PortfolioItem/Feature';
        Description: string;
        FormattedID: string;
        Milestones: WsapiObjectRef<'Milestone'>;
        Name: string;
        Owner: WsapiObjectRef<'User'>;
        Project: WsapiObjectRef<'Project'>;
        Workspace: WsapiObjectRef<'Workspace'>;
        Blocked: boolean;
        BlockedReason?: string;
        Blocker?: string;
        Parent?: WsapiObjectRef<'Project'>;
        PercentDoneByStoryCount: number;
        PercentDoneByStoryPlanEstimate: number;
        PlannedEndDate?: string;
        PlannedStartDate?: string;
        PortfolioItemType: WsapiObjectRef<'Feature'>;
        PortfolioItemTypeName: 'Feature';
        PreliminaryEstimate?: string;
        PreliminaryEstimateValue?: string;
        Predecessors: WsapiObjectRef<'PortfolioItem/Feature'>;
        Release?: string;
        State: 'Open' | 'Closed';
        Successors: WsapiObjectRef<'PortfolioItem/Feature'>;
        UserStories: WsapiObjectRef<'HierarchicalRequirement'>;
    }

    export interface Project extends WsapiObject {
        _type: 'Project';
        BuildDefinitions: WsapiCollectionRef<'BuildDefinition'>;
        Children: WsapiCollectionRef<'Project'>;
        Description: string;
        Iterations: WsapiCollectionRef<'Iteration'>;
        Name: string;
        Notes: string;
        Owner: WsapiObjectRef<'User'>;
        Parent?: WsapiObjectRef<'Project'>;
        Releases: WsapiCollectionRef<'Release'>;
        RevisionHistory: WsapiCollectionRef<'RevisionHistory'>;
        SchemaVersion: string;
        State: 'Open' | 'Closed';
        Subscription: WsapiObjectRef<'Subscription'>;
        TeamMembers: WsapiCollectionRef<'User'>;
        Workspace: WsapiObjectRef<'Workspace'>;
        c_JiraProjectKey: string;
    }

    export interface WsapiObjectRef<T extends string> {
        _rallyAPIMajor: string;
        _rallyAPIMinor: string;
        _ref: string;
        _refObjectName: string;
        _refObjectUUID: string;
        _type: T;
    }

    export interface QueryResult<T> {
        QueryResult: WsapiResult & {
          PageSize: number;
          Results: Array<T>;
          StartIndex: number;
          TotalResultCount: number;
        };
    }

    export interface Subscription extends WsapiObject {
        _type: 'Subscription';
        Name: string;
        SubscriptionID: number;
        SubscriptionType: string;
        Workspaces: WsapiCollectionRef<'Workspace'>;
        ZuulID: string;
    }

    interface WsapiResult {
        _rallyAPIMajor: '2';
        _rallyAPIMinor: '0';
        Errors: string[];
        Warnings: string[];
      }

      interface WsapiObject {
        _objectVersion: string;
        _rallyAPIMajor: '2';
        _rallyAPIMinor: '0';
        _ref: string;
        _refObjectName: string;
        _refObjectUUID: string;
        _type: string;
        ObjectID: number;
        ObjectUUID: string;
      }

      interface WsapiCollectionRef<T extends string>{
        _rallyAPIMajor: '2';
        _rallyAPIMinor: '0';
        _ref: string;
        _type: T;
        Count: number;
      }
}

