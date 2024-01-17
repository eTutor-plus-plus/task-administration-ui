export interface AppInfo {
  git?: AppInfoGit;
  build?: AppInfoBuild;
  java: AppInfoJava;
  os: AppInfoOs;
}

export interface AppInfoOs {
  name: string;
  version: string;
  arch: string;
}

export interface AppInfoJava {
  version: string;
  vendor: {
    name: string;
    version: string;
  };
  runtime: {
    name: string;
    version: string;
  };
  jvm: {
    name: string;
    vendor: string;
    version: string;
  };
}

export interface AppInfoBuild {
  artifact: string;
  name: string;
  time: string;
  version: string;
  group: string;
}

export interface AppInfoGit {
  branch: string;
  dirty: string;
  commit: {
    time: string;
    id: {
      'describe-short': string;
      abbrev: string;
      full: string;
      describe: string;
    };
  };
}
