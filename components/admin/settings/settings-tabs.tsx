"use client";

import * as React from "react";
import { combineQueries, useSettings, useWebsiteContent } from "@/lib/query";
import { RenderContent } from "@/components/shared/render-content";
import { FormSkeleton } from "@/components/shared/skeletons";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClinicSettingsForm } from "./clinic-settings-form";
import { WebsiteContentForm } from "./website-content-form";
import { SystemInfo } from "./system-info";

export function SettingsTabs({ initialTab }: { initialTab?: string }) {
  const query = combineQueries(useSettings(), useWebsiteContent());
  const [tab, setTab] = React.useState(["clinic", "website", "system"].includes(initialTab ?? "") ? initialTab! : "clinic");
  return (
    <Tabs
      value={tab}
      onValueChange={(v) => {
        setTab(v);
        window.history.replaceState(null, "", `?tab=${v}`);
      }}
    >
      <TabsList>
        <TabsTrigger value="clinic">Clinic & booking</TabsTrigger>
        <TabsTrigger value="website">Website content</TabsTrigger>
        <TabsTrigger value="system">Notifications & data</TabsTrigger>
      </TabsList>
      {tab !== "system" && (
      <RenderContent query={query} loading={<FormSkeleton />} errorTitle="Couldn't load settings">
        {([settings, content]) => (
          <>
            <TabsContent value="clinic">
              <ClinicSettingsForm settings={settings} />
            </TabsContent>
            <TabsContent value="website">
              <WebsiteContentForm content={content} />
            </TabsContent>
          </>
        )}
      </RenderContent>
      )}
      <TabsContent value="system">
        <SystemInfo />
      </TabsContent>
    </Tabs>
  );
}
