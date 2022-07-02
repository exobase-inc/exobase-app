/* eslint-disable react-hooks/exhaustive-deps */
import _ from 'radash'
import { useEffect, useState } from "react";
import * as t from "../../types";
import { useNavigate } from "react-router";
import Recoil from "recoil";
import { Split } from "../layout";
import {
  Pane,
  Heading,
  Button,
  TextInputField,
  toaster,
  Strong,
  Text,
  Select,
  majorScale,
  Badge,
  Link,
  TagInput,
  Paragraph,
  TextInput,
  IconButton,
  SelectMenu,
} from "evergreen-ui";
import { workspaceState, idTokenState } from "../../state/app";
import { useFetch, useFormation } from "../../hooks";
import api from "../../api";
import * as yup from "yup";
import {
  SceneLayout,
  SelectList,
  KeyValueForm,
  GridBoxSelect,
  GitHubSourceSearch,
  StackConfigForm,
  WizardProgress,
} from "../ui";
import { HiArrowLeft, HiArrowRight, HiOutlineDuplicate } from "react-icons/hi";
import { useParams } from "react-router-dom";
import EnvironmentVariableForm from '../ui/EnvironmentVariableForm';

type Step =
  | "name-tags"
  | "build-pack"
  | "domain"
  | "source"
  | "source-review"
  | "config"
  | "review";

type State = {
  language: t.Language | null;
  service: t.CloudService | null;
  provider: t.CloudProvider | null;
  type: t.ExobaseService | null;
  step: Step;
  config: any;
  name: string | null;
  source: null | t.ServiceSource;
  domain: null | {
    domain: string
    subdomain: null | string
  }
  tags: t.KeyValue[]
  pack: t.BuildPackageRef | null
};

export default function CreateServiceScene() {
  const { platformId } = useParams() as { platformId: string }
  const navigate = useNavigate();
  const idToken = Recoil.useRecoilValue(idTokenState);
  const workspace = Recoil.useRecoilValue(workspaceState)
  const createServiceRequest = useFetch(api.units.create);
  const listBuildPacksRequest = useFetch(api.registry.search);
  const [state, setState] = useState<State>({
    step: 'name-tags',
    language: null,
    service: null,
    provider: null,
    type: null,
    config: {},
    source: null,
    name: null,
    domain: null,
    tags: [],
    pack: null
  });

  useEffect(() => {
    listBuildPacksRequest.fetch({})
  }, [])
  
  const platform = workspace?.platforms.find(p => p.id === platformId)
  
  if (!workspace || !platform) {
    return (
      <span>something is wrong</span>
      )
    }

    const domains: t.Domain[] = (() => {
      if (!state.provider) return []
      const provs = platform.providers as any as Record<t.CloudProvider, {
        domains: t.Domain[]
      }>
      const p = provs[state.provider]
      if (!p) return []
      return p.domains
    })()

  const handleNameTags = (data: {
    name: string;
    tags: t.KeyValue[]
  }) => {
    setState({
      ...state,
      ...data,
      step: "build-pack",
    });
  };

  const handleBuildPack = (data: {
    type: t.ExobaseService;
    provider: t.CloudProvider;
    service: t.CloudService;
    pack: t.BuildPackageRef
  }) => {
    setState({
      ...state,
      ...data,
      step: "domain",
      config: data.pack.version.inputs.reduce((acc, item) => {
        if (!item.default) return acc
        const defaultValue = (() => {
          if (item.ui === 'string') return item.default
          if (item.ui === 'number') return parseInt(item.default)
          if (item.ui === 'envars') return [] // JSON.parse(item.default)
          if (item.ui === 'bool') return item.default === 'true' ? true : false
          return item.default
        })()
        return ({ ...acc, [item.name]: defaultValue })
      }, {} as Record<string, any>)
    });
  };

  console.log('x--> PACK: ', state.pack)
  console.log('x--> CONFIG: ', state.config)

  const handleSource = (source: t.ServiceSource) => {
    setState({ ...state, source, step: "config" });
  };

  const handleConfigSubmit = () => {
    setState({ ...state, step: "review" });
  };

  const handleConfigChange = (config: any) => {
    setState({ ...state, config })
  }

  const handleDomain = (domain: {
    domain: string
    subdomain: null | string
  }) => {
    const nextStep: Step = !!state.source ? "source-review" : "source";
    setState({ ...state, domain, step: nextStep });
  };

  const submit = async () => {
    const { error } = await createServiceRequest.fetch(
      {
        workspaceId: workspace.id,
        platformId,
        name: state.name!,
        tags: state.tags.map(kv => ({ name: kv.key, value: kv.value })),
        source: state.source,
        packId: state.pack!.id,
        packConfig: state.config,
        domainId: domains.find(d => d.domain === state.domain?.domain)?.id ?? null,
        subdomain: state.domain?.subdomain ?? null
      },
      { token: idToken! }
    );

    if (error) {
      console.error(error);
      toaster.danger(error.details);
      return;
    }

    navigate(`/platform/${platformId}/services`);
  };

  const cancel = () => {
    navigate(`/platform/${platformId}/services`);
  };

  const setStep = (step: Step) => () => {
    setState({ ...state, step });
  };

  const title = (() => {
    if (state.step === "name-tags") return "Create New Service";
    return `Create ${state.name} Service`;
  })();

  const subtitle = (() => {
    if (state.step === "name-tags")
      return `
        Create a new service in the ${platform.name} platform.
        Add tags to help you organize services in the dashboard.
      `;
    if (state.step === "build-pack") {
      return `
        What are you building and how do you want to deploy it?
      `;
    }
    if (state.step === "domain") {
      return `
        This step is optional. If you do not specify a domain 
        the cloud provider/service will provide one after the
        service is deployed.
      `;
    }
    if (state.step === "source" || state.step === "source-review") {
      return `
        Exobase needs a GitHub repository to use as the source. You 
        can link us to a public repository or connect to GitHub to 
        select a private repository.
      `;
    }
    if (state.step === "config") {
      return `
        We've set default values for your cloud provider/service. You can
        expand the advanced section and customize if needed.
      `;
    }
    if (state.step === "review") {
      return `
        Double check that all is ok. Confirming will not deploy your service.
        You can deploy with one click after it is created.
      `;
    }
    return "";
  })();

  return (
    <SceneLayout subtitle="Create Service">
      <Pane
        display="flex"
        flexDirection="row"
        alignItems="center"
        justifyContent="center"
        paddingBottom={majorScale(4)}
      >
        <Pane maxWidth="500px" flex={1}>
          <Pane>
            <Heading size={800}>{title}</Heading>
            <Paragraph>{subtitle}</Paragraph>
          </Pane>
          <WizardProgress
            marginY={majorScale(2)}
            steps={["init", "type", "domain", "source", "config", "confirm"]}
            current={(() => {
              if (state.step === "name-tags") return "init";
              if (state.step === "build-pack") return "type";
              if (state.step === "domain") return "domain";
              if (state.step === "source") return "source";
              if (state.step === "source-review") return "source";
              if (state.step === "config") return "config";
              if (state.step === "review") return "confirm";
              return "confirm";
            })()}
          />
          {state.step === "name-tags" && (
            <ServiceNameTagsForm
              onBack={cancel}
              onSubmit={handleNameTags}
            />
          )}
          {state.step === "build-pack" && (
            <BuildPackForm
              packs={listBuildPacksRequest.data?.packs ?? []}
              onSubmit={handleBuildPack}
              onBack={setStep("name-tags")}
            />
          )}
          {state.step === "domain" && (
            <ServiceDomainForm
              initDomain={state.domain}
              platform={platform}
              provider={state.provider!}
              domains={domains}
              onSubmit={handleDomain}
              onSkip={setStep("source")}
              onBack={setStep("build-pack")}
            />
          )}
          {state.step === "source" && (
            <RepositorySourceForm
              idToken={idToken ?? ""}
              platform={platform}
              onSubmit={handleSource}
              onBack={setStep("domain")}
              onSkip={setStep("config")}
            />
          )}
          {state.step === "source-review" && (
            <RepositoryReview
              source={state.source!}
              onChange={setStep("source")}
              onNext={setStep("config")}
              onBack={setStep("domain")}
            />
          )}
          {state.step === "config" && (
            <ServiceConfigForm
              pack={state.pack!}
              config={state.config}
              platform={platform}
              serviceName={state.name!}
              onBack={state.source ? setStep("source-review") : setStep('source')}
              onChange={handleConfigChange}
              onSubmit={handleConfigSubmit}
            />
          )}
          {state.step === "review" && (
            <ServiceReviewForm
              loading={createServiceRequest.loading}
              state={state}
              onSubmit={submit}
              onBack={setStep("config")}
            />
          )}
        </Pane>
      </Pane>
    </SceneLayout>
  );
}

function ServiceReviewForm({
  state,
  loading = false,
  onSubmit,
  onBack,
}: {
  state: State;
  loading?: boolean;
  onSubmit: () => void;
  onBack: () => void;
}) {
  const url =
    state.domain &&
    (state.domain.subdomain === ""
      ? `https://${state.domain.domain}`
      : `https://${state.domain?.subdomain}.${state.domain?.domain}`);
  return (
    <>
      <Pane marginTop={majorScale(2)}>
        <Heading size={700}>{state.name}</Heading>
        <Paragraph>
          A {state.language} {state.type} running on {state.provider}{" "}
          {state.service}.
        </Paragraph>
        <Pane>
          {state.tags.map((tag, idx) => (
            <Badge key={idx} marginRight={majorScale(1)}>
              {tag.key}={tag.value}
            </Badge>
          ))}
        </Pane>
        {url && (
          <Pane marginTop={majorScale(4)}>
            <Heading marginBottom={majorScale(1)}>Domain</Heading>
            <Link href={url}>{url}</Link>
          </Pane>
        )}
        <Pane marginTop={majorScale(4)}>
          <Heading marginBottom={majorScale(1)}>Source</Heading>
          <SelectList
            items={[
              {
                id: "selected",
                label: `${state.source?.owner}/${state.source?.repo}`,
                subtitle: state.source?.branch,
                link: `https://github.com/${state.source?.owner}/${state.source?.repo}`,
                selectable: false,
              },
            ]}
          />
        </Pane>
        {state.config?.environmentVariables &&
          state.config.environmentVariables.length > 0 && (
            <Pane marginTop={majorScale(4)}>
              <Heading marginBottom={majorScale(1)}>
                Environment Variables
              </Heading>
              <EnvironmentVariableForm
                disabled
                hideSecrets
                hideHeader
                values={state.config.environmentVariables}
              />
            </Pane>
          )}
      </Pane>
      <Split marginTop={majorScale(4)}>
        <Pane flex={1}>
          <BackButton onClick={onBack} />
        </Pane>
        <NextButton onClick={onSubmit} isLoading={loading}>
          create
        </NextButton>
      </Split>
    </>
  );
}

function ServiceNameTagsForm({
  onSubmit,
  onBack,
}: {
  onSubmit: (data: {
    name: string;
    tags: t.KeyValue[]
  }) => void;
  onBack: () => void;
}) {
  const [tags, setTags] = useState<t.KeyValue[]>([]);
  const form = useFormation(
    {
      name: yup.string().required(),
    },
    {
      name: "",
    }
  );

  const handleSubmit = (formData: { name: string }) => {
    onSubmit({ name: formData.name, tags });
  };

  return (
    <>
      <Pane width="100%" marginTop={majorScale(2)}>
        <TextInputField
          label="Name"
          placeholder="Auth"
          validationMessage={form.errors.name?.message}
          {...form.register("name")}
        />
        <Pane marginTop={majorScale(4)}>
          <Pane>
            <Text>Tags</Text>
          </Pane>
          <KeyValueForm
            onChange={setTags}
            value={tags}
          />
        </Pane>
      </Pane>
      <Split marginTop={majorScale(4)}>
        <Pane flex={1}>
          <BackButton onClick={onBack}>cancel</BackButton>
        </Pane>
        <NextButton onClick={form.createHandler(handleSubmit)} />
      </Split>
    </>
  );
}

const RepositoryReview = ({
  source,
  onChange,
  onNext,
  onBack,
}: {
  source: t.ServiceSource;
  onChange?: () => void;
  onNext?: () => void;
  onBack?: () => void;
}) => {
  return (
    <>
      <SelectList
        items={[
          {
            id: "selected",
            label: `${source.owner}/${source.repo}`,
            subtitle: source.branch,
            link: `https://github.com/${source.owner}/${source.repo}`,
            selectLabel: "change",
            selectAppearance: "minimal",
          },
        ]}
        onSelect={onChange}
      />
      <Split marginTop={majorScale(4)}>
        <Pane flex={1}>
          <BackButton onClick={onBack} />
        </Pane>
        <NextButton onClick={onNext} />
      </Split>
    </>
  );
};

function RepositorySourceForm({
  platform,
  idToken,
  onSubmit,
  onBack,
  onSkip,
}: {
  platform: t.Platform;
  idToken: string;
  onSubmit: (source: t.ServiceSource) => void;
  onBack: () => void;
  onSkip?: () => void
}) {
  return (
    <Pane marginTop={majorScale(2)}>
      <GitHubSourceSearch
        platform={platform}
        idToken={idToken}
        onSubmit={onSubmit}
      />
      <div className="mt-4 flex flex-row justify-between">
        <BackButton onClick={onBack} />
        <button onClick={onSkip} className="py-1 px-2 bg-slate-200 text-slate-900 hover:bg-slate-300">skip</button>
      </div>
    </Pane>
  );
}

const BuildPackForm = ({
  packs,
  onSubmit,
  onBack,
}: {
  packs: t.BuildPackage[]
  onSubmit: (data: {
    type: t.ExobaseService;
    provider: t.CloudProvider;
    service: t.CloudService;
    pack: t.BuildPackageRef
  }) => void;
  onBack: () => void;
}) => {
  const [state, setState] = useState<{
    type: null | t.ExobaseService;
    provider: null | t.CloudProvider;
    service: null | t.CloudService;
    packId: null | string
  }>({
    type: null,
    provider: null,
    service: null,
    packId: null
  });
  const update = (key: "type" | "provider" | "service" | "packId") => (value: any) => {
    setState({ ...state, [key]: value });
  };
  // const serviceChoices = PROVIDER_SERVICE_TYPE[state.provider][state.type];
  const packChoices = packs.filter(p => {
    if (state.provider && p.provider !== state.provider) return false
    if (state.type && p.type !== state.type) return false
    if (state.service && p.service !== state.service) return false
    return true
  })
  const submitPack = () => {
    const pack = packs.find(p => p.id === state.packId)
    if (!pack) return
    const packRef = _.shake({
      ...pack,
      versions: undefined,
      version: pack.versions.find(v => v.version === pack.latest)!
    }) as  t.BuildPackageRef
    onSubmit({
      type: state.type!,
      provider: state.provider!,
      service: state.service!,
      pack: packRef
    })
  }
  return (
    <Pane>
      <Pane marginTop={majorScale(4)}>
        <Heading>What type of web service are you building?</Heading>
        <GridBoxSelect<t.ExobaseService>
          marginTop={majorScale(2)}
          onSelect={update("type")}
          selected={state.type}
          choices={[
            {
              label: "Static Website",
              key: "static-website",
            },
            {
              label: "API",
              key: "api",
            },
            {
              label: "Task Runner",
              key: "task-runner",
            },
            {
              label: "Websocket Server",
              key: "websocket-server",
              comingSoon: true,
            },
            {
              label: "App",
              key: "app",
              comingSoon: true,
            },
          ]}
        />
      </Pane>
      <Pane marginTop={majorScale(4)}>
        <Heading>Where do you want to host it?</Heading>
        <GridBoxSelect<t.CloudProvider>
          marginTop={majorScale(2)}
          onSelect={update("provider")}
          selected={state.provider}
          choices={[
            {
              label: "AWS",
              key: "aws",
            },
            {
              label: "GCP",
              key: "gcp",
              comingSoon: true,
            }
          ]}
        />
      </Pane>
      <Pane marginTop={majorScale(4)}>
        <Heading>What service do you want to run it on?</Heading>
        <GridBoxSelect<t.CloudService>
          marginTop={majorScale(2)}
          selected={state.service}
          onSelect={update("service")}
          choices={packChoices.filter(p => !!p.service).map(p => ({ label: p.service!, key: p.service! }))}
        />
      </Pane>
      <Pane marginTop={majorScale(4)}>
        <Heading>Select your Build Pack</Heading>
        <GridBoxSelect<string>
          marginTop={majorScale(2)}
          selected={state.service}
          onSelect={update("packId")}
          choices={packChoices.map(p => ({ label: p.name, key: p.id }))}
        />
      </Pane>
      <Split marginTop={majorScale(4)}>
        <Pane flex={1}>
          <BackButton onClick={onBack} />
        </Pane>
        <NextButton disabled={!state.packId} onClick={submitPack} />
      </Split>
    </Pane>
  );
};

const ServiceConfigForm = ({
  config,
  pack,
  platform,
  serviceName,
  onSubmit,
  onChange,
  onBack,
}: {
  config: any;
  pack: t.BuildPackageRef;
  platform: t.Platform | null;
  serviceName: string;
  onChange: (config: any) => void
  onSubmit: () => void;
  onBack: () => void;
}) => {

  const copyServiceConfig = (unitId: string) => {
    const service = platform?.units.find(u => u.id === unitId)
    if (!service) return
    onChange(service.config)
  }

  return (
    <Pane>
      <Pane>
        <SelectMenu
          title="Select Service"
          options={
            platform?.units.filter(u => u.pack.id === pack.id).map(u => ({ label: u.name, value: u.id })) ?? []
          }
          onSelect={(item) => copyServiceConfig(item.value as string)}
        >
          <Button iconBefore={<HiOutlineDuplicate />}>
            Copy Existing
          </Button>
        </SelectMenu>
      </Pane>
      <StackConfigForm
        pack={pack}
        config={config}
        platformName={platform?.name ?? ''}
        serviceName={serviceName}
        onChange={onChange}
      />
      <Split marginTop={majorScale(4)}>
        <Pane flex={1}>
          <BackButton onClick={onBack} />
        </Pane>
        <NextButton
          // disabled={!stackConfig.isValid}
          onClick={() => onSubmit()}
        />
      </Split>
    </Pane>
  );
};

const ServiceDomainForm = ({
  initDomain,
  platform,
  provider,
  domains,
  onSubmit,
  onSkip,
  onBack,
}: {
  initDomain: { domain: string; subdomain: string | null } | null;
  platform: t.Platform;
  provider: t.CloudProvider;
  domains: t.Domain[];
  onSubmit: (d: { domain: string; subdomain: string | null}) => void;
  onSkip?: () => void;
  onBack?: () => void;
}) => {

  const [domain, setDomain] = useState(initDomain ? initDomain.domain : "");
  const subdomainForm = useFormation<{ subdomain: string }>(
    initDomain
      ? {
          subdomain: initDomain.subdomain,
        }
      : {
          subdomain: "",
        }
  );

  const handleSubmit = () => {
    onSubmit({
      domain,
      subdomain: subdomainForm.watch().subdomain,
    });
  };

  const canSubmit = (() => {
    if (!domain) return false;
    if (domain === "") return false;
    if (domain === "_none_selected") return false;
    return true;
  })();

  return (
    <Pane marginTop={majorScale(4)}>
      {domains.length > 0 && (
        <Pane>
          <Heading marginBottom={majorScale(1)}>Domain</Heading>
          <Split alignItems="flex-end">
            <TextInput
              placeholder="dev"
              {...subdomainForm.register("subdomain")}
            />
            <Pane marginX={majorScale(1)}>
              <Strong>.</Strong>
            </Pane>
            <Select
              value={domain || "_none_selected"}
              onChange={(e: any) => setDomain(e.target.value)}
            >
              <option value="_none_selected">Select Domain</option>
              {domains.map((d) => (
                <option key={d.domain} value={d.domain}>
                  {d.domain}
                </option>
              ))}
            </Select>
          </Split>
        </Pane>
      )}
      {domains.length === 0 && (
        <Paragraph>
          There are no domains configured for the {provider} cloud provider. You
          can configure one and return or continue without a custom domain. A
          custom domain can always be added or changed to a running service.
        </Paragraph>
      )}
      <Split marginTop={majorScale(4)}>
        <Pane flex={1}>
          <BackButton onClick={onBack} />
        </Pane>
        <Button
          appearance="minimal"
          onClick={onSkip}
          marginRight={majorScale(1)}
        >
          skip
        </Button>
        <NextButton onClick={handleSubmit} disabled={!canSubmit} />
      </Split>
    </Pane>
  );
};

const BackButton = ((props: any) => {
  return (
    <Button
      appearance="minimal"
      iconBefore={<HiArrowLeft size={12} />}
      {...props}
    >
      {props.children ? props.children : "back"}
    </Button>
  );
}) as typeof Button;

const NextButton = ((props: any) => {
  return (
    <Button
      appearance="primary"
      iconAfter={<HiArrowRight size={12} />}
      {...props}
    >
      {props.children ? props.children : "next"}
    </Button>
  );
}) as typeof Button;
