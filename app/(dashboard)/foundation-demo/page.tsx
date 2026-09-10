"use client";

import React, { useState } from "react";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Tabs, TabList, Tab, TabPanel } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownTrigger,
  DropdownContent,
  DropdownItem,
  DropdownSeparator,
} from "@/components/ui/dropdown-menu";
import { useDisclosure } from "@/hooks/use-disclosure";
import { useToast } from "@/hooks/use-toast";

export default function FoundationDemoPage() {
  const { addToast } = useToast();

  // Dialog State
  const dialogDisclosure = useDisclosure();

  // Confirmation Dialog State
  const confirmDisclosure = useDisclosure();
  const [confirmLoading, setConfirmLoading] = useState(false);

  // Loading/Disabled Demo State
  const [isDemoLoading, setIsDemoLoading] = useState(false);
  const [isDemoDisabled, setIsDemoDisabled] = useState(false);

  const handleSimulateConfirm = () => {
    setConfirmLoading(true);
    setTimeout(() => {
      setConfirmLoading(false);
      confirmDisclosure.onClose();
      addToast({
        title: "Action Confirmed",
        description: "The demonstration confirmation callback was executed successfully.",
        variant: "success",
      });
    }, 1500);
  };

  return (
    <PageContainer>
      <PageHeader
        title="Foundation Interaction Demo"
        description="Internal verification suite for reusable interaction primitives, Obsidian Precision tokens, and state feedback patterns."
        breadcrumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "Foundation Demo" },
        ]}
        action={<Badge variant="outline" size="sm">Step 6 Primitives</Badge>}
      />

      <div className="space-y-6">
        {/* DEMO 1 & 2: DIALOG & CONFIRMATION DIALOG */}
        <Card variant="standard">
          <CardHeader>
            <CardTitle>1 &amp; 2. Modal Dialogs &amp; Confirmation Patterns</CardTitle>
            <CardDescription>
              Accessible controlled modal dialogs supporting focus traps, keyboard Escape key handlers, and confirmation callbacks.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button variant="primary" size="sm" onClick={dialogDisclosure.onOpen}>
              Open Modal Dialog
            </Button>

            <Button variant="secondary" size="sm" onClick={confirmDisclosure.onOpen}>
              Open Confirmation Dialog
            </Button>

            {/* Standard Modal Dialog */}
            <Dialog
              open={dialogDisclosure.isOpen}
              onOpenChange={dialogDisclosure.setIsOpen}
              title="Instructional Modal Dialog"
              description="This modal demonstrates accessible dialog behavior with a focus trap and Escape key listener."
            >
              <div className="space-y-4 text-xs text-zinc-400">
                <p>
                  Pressing <kbd className="px-1.5 py-0.5 bg-[#0d0d12] border border-white/[0.08] rounded text-white font-mono">Escape</kbd> or clicking the backdrop overlay will close this dialog. Focus will automatically return to the opening trigger button.
                </p>
                <Input label="Sample Demo Field" placeholder="Enter instructional text..." />
                <div className="pt-3 flex justify-end space-x-2 border-t border-white/[0.06]">
                  <Button variant="secondary" size="sm" onClick={dialogDisclosure.onClose}>
                    Close Dialog
                  </Button>
                </div>
              </div>
            </Dialog>

            {/* Confirmation Dialog */}
            <ConfirmDialog
              open={confirmDisclosure.isOpen}
              onOpenChange={confirmDisclosure.setIsOpen}
              title="Confirm Action Demo"
              description="Are you sure you want to execute this demonstration action? This confirmation pattern is reusable across future features."
              confirmLabel="Execute Demo Action"
              cancelLabel="Cancel"
              variant="destructive"
              isLoading={confirmLoading}
              onConfirm={handleSimulateConfirm}
            />
          </CardContent>
        </Card>

        {/* DEMO 3: ACCESSIBLE TABS */}
        <Card variant="standard">
          <CardHeader>
            <CardTitle>3. Accessible Tabs Primitive</CardTitle>
            <CardDescription>
              Keyboard-navigable tablist implementation supporting ARIA tablist patterns and arrow key switching.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="tab1">
              <TabList>
                <Tab value="tab1">General Info</Tab>
                <Tab value="tab2">Configuration</Tab>
                <Tab value="tab3" disabled>
                  Disabled Tab
                </Tab>
              </TabList>
              <TabPanel value="tab1">
                <div className="p-4 bg-[#0d0d12] border border-white/[0.06] rounded-xl space-y-1">
                  <h4 className="text-xs font-semibold text-white">Tab 1: General Info Content</h4>
                  <p className="text-xs text-zinc-400">
                    Demonstrates basic tab panel presentation using standard obsidian tokens.
                  </p>
                </div>
              </TabPanel>
              <TabPanel value="tab2">
                <div className="p-4 bg-[#0d0d12] border border-white/[0.06] rounded-xl space-y-1">
                  <h4 className="text-xs font-semibold text-white">Tab 2: Configuration Panel</h4>
                  <p className="text-xs text-zinc-400">
                    Demonstrates secondary tab panel switching with zero page refresh.
                  </p>
                </div>
              </TabPanel>
            </Tabs>
          </CardContent>
        </Card>

        {/* DEMO 4: DROPDOWN MENU */}
        <Card variant="standard">
          <CardHeader>
            <CardTitle>4. Popover Dropdown Menu</CardTitle>
            <CardDescription>
              Accessible popover trigger menu with outside click detection and Escape key closing.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DropdownMenu>
              <DropdownTrigger>
                <Button variant="secondary" size="sm" className="flex items-center gap-1.5">
                  <span>Options Menu</span>
                  <svg className="w-3.5 h-3.5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </Button>
              </DropdownTrigger>
              <DropdownContent align="left">
                <DropdownItem
                  onClick={() =>
                    addToast({ title: "Selected Option 1", variant: "default" })
                  }
                >
                  Option One
                </DropdownItem>
                <DropdownItem
                  onClick={() =>
                    addToast({ title: "Selected Option 2", variant: "default" })
                  }
                >
                  Option Two
                </DropdownItem>
                <DropdownSeparator />
                <DropdownItem disabled>Disabled Option</DropdownItem>
              </DropdownContent>
            </DropdownMenu>
          </CardContent>
        </Card>

        {/* DEMO 5: TOAST NOTIFICATIONS */}
        <Card variant="standard">
          <CardHeader>
            <CardTitle>5. Toast Notification System</CardTitle>
            <CardDescription>
              Monochrome notification stack supporting auto-dismissal, manual dismissal, and multiple toast variants.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button
              variant="secondary"
              size="sm"
              onClick={() =>
                addToast({
                  title: "Default Notification",
                  description: "Standard system alert message.",
                  variant: "default",
                })
              }
            >
              Trigger Default Toast
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={() =>
                addToast({
                  title: "Success Notification",
                  description: "Action completed successfully.",
                  variant: "success",
                })
              }
            >
              Trigger Success Toast
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={() =>
                addToast({
                  title: "Warning Notification",
                  description: "Proceed with caution.",
                  variant: "warning",
                })
              }
            >
              Trigger Warning Toast
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={() =>
                addToast({
                  title: "Error Notification",
                  description: "Validation or processing requirement failed.",
                  variant: "error",
                })
              }
            >
              Trigger Error Toast
            </Button>
          </CardContent>
        </Card>

        {/* DEMO 6: LOADING & DISABLED STATES */}
        <Card variant="standard">
          <CardHeader>
            <CardTitle>6. Loading &amp; Disabled Interaction States</CardTitle>
            <CardDescription>
              Interactive controls for testing UI state presentation across buttons and form inputs.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsDemoLoading(!isDemoLoading)}
              >
                Toggle Loading: {isDemoLoading ? "ON" : "OFF"}
              </Button>

              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsDemoDisabled(!isDemoDisabled)}
              >
                Toggle Disabled: {isDemoDisabled ? "ON" : "OFF"}
              </Button>
            </div>

            <div className="p-4 bg-[#0d0d12] border border-white/[0.06] rounded-xl space-y-4 max-w-md">
              <Input
                label="Sample State Input"
                placeholder="Type here..."
                disabled={isDemoDisabled}
              />
              <Button
                variant="primary"
                size="sm"
                className="w-full"
                disabled={isDemoDisabled || isDemoLoading}
              >
                {isDemoLoading ? "Processing State..." : "Action Button"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
