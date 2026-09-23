import { useState } from "react";
import { identityFor } from "@/shared/brand/identity";
import { Button } from "@/shared/kit/Button";
import { ButtonLink } from "@/shared/kit/ButtonLink";
import { DateField } from "@/shared/kit/DateField";
import { Field } from "@/shared/kit/Field";
import { IconButton } from "@/shared/kit/IconButton";
import { PasswordField } from "@/shared/kit/PasswordField";
import { RadioPills } from "@/shared/kit/RadioPills";
import { RuleList } from "@/shared/kit/RuleList";
import { SearchField } from "@/shared/kit/SearchField";
import { Segmented, Tabs } from "@/shared/kit/Segmented";
import { Select } from "@/shared/kit/Select";
import { tabId, tabPanelId } from "@/shared/kit/tabIds";
import { TextArea } from "@/shared/kit/TextArea";
import { Toggle } from "@/shared/kit/Toggle";
import { KitBlock } from "./KitBlock";

type Room = "everyone" | "following" | "yours" | "saved";
type ProfileTab = "posts" | "saved";

export function ControlsSection() {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<string>();
  const [handle, setHandle] = useState("leila.harb");
  const [password, setPassword] = useState("");
  const [query, setQuery] = useState("");
  const [bio, setBio] = useState("Painted the balcony door sunflower yellow.");
  const [gender, setGender] = useState<string>();
  const [city, setCity] = useState("");
  const [birthday, setBirthday] = useState("");
  const [notify, setNotify] = useState(true);
  const [room, setRoom] = useState<Room>("everyone");
  const [tab, setTab] = useState<ProfileTab>("posts");

  const handleValid = /^[a-z0-9._]{3,15}$/i.test(handle);
  const rules = [
    { label: "8+ characters", met: password.length >= 8 },
    { label: "A capital", met: /[A-Z]/.test(password) },
    { label: "A lowercase", met: /[a-z]/.test(password) },
    { label: "A number", met: /\d/.test(password) },
    { label: "A symbol", met: /[#?!@$ %^&*-]/.test(password) },
  ];

  const runLoading = () => {
    setLoading(true);
    setDone(false);
    window.setTimeout(() => {
      setLoading(false);
      setDone(true);
    }, 1400);
  };

  return (
    <div className="grid gap-16" id="controls">
      <h2 className="type-display">Controls</h2>

      <KitBlock title="Buttons" note="Hover lifts and tilts, press squishes, release springs. Loading keeps the width.">
        <div className="flex flex-wrap items-center gap-3">
          <Button>Post</Button>
          <Button variant="secondary">Cancel</Button>
          <Button variant="ghost">Skip</Button>
          <Button variant="sticker" fill="sun">
            Join Aura
          </Button>
          <Button variant="sticker" fill="violet">
            Claim it
          </Button>
          <Button variant="destructive" iconStart="trash">
            Delete
          </Button>
          <Button variant="link">Forgot password?</Button>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button size="sm">Small</Button>
          <Button size="md">Medium</Button>
          <Button size="lg" iconEnd="arrow-right">
            Large
          </Button>
          <Button loading={loading} success={done} onClick={runLoading}>
            {done ? "Saved" : "Save changes"}
          </Button>
          <Button disabled>Disabled</Button>
          <ButtonLink to="/__kit#controls" variant="secondary" iconEnd="arrow-up-right">
            Link button
          </ButtonLink>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <IconButton glyph="plus" label="New post" variant="primary" />
          <IconButton glyph="search" label="Search" />
          <IconButton glyph="bell" label="Alerts" badge={3} />
          <IconButton glyph="more" label="More" variant="ghost" size="sm" />
          <IconButton glyph="camera" label="Change photo" size="lg" />
        </div>
      </KitBlock>

      <KitBlock title="Input system" note="Hover, focus ring in the person's identity colour, error shake + message, success tick, loading, disabled.">
        <div className="grid gap-6 md:grid-cols-2">
          <Field
            label="Username"
            value={handle}
            onChange={(event) => setHandle(event.target.value)}
            iconStart="at"
            counter={{ value: handle.length, max: 15 }}
            ringColor={identityFor(handle).color.hex}
            success={handleValid}
            error={handle && !handleValid ? "3–15 letters, numbers, dots or underscores." : undefined}
            hint="Your ring is your identity colour."
          />
          <div className="grid gap-3">
            <Field
              label="Email"
              type="email"
              iconStart="mail"
              placeholder="name@example.com"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                setEmailError(undefined);
              }}
              error={emailError}
            />
            <Button
              variant="secondary"
              size="sm"
              className="justify-self-start"
              onClick={() => setEmailError(/^\S+@\S+\.\S+$/.test(email) ? undefined : "Enter a valid email address.")}
            >
              Validate
            </Button>
          </div>
          <div className="grid gap-3">
            <PasswordField
              label="Password"
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              success={rules.every((rule) => rule.met)}
            />
            <RuleList rules={rules} />
          </div>
          <SearchField value={query} onValueChange={setQuery} placeholder="Search people" loading={query.length > 2} />
          <TextArea label="Bio" value={bio} onChange={(event) => setBio(event.target.value)} maxLength={60} hint="Keep it short." />
          <div className="grid gap-6">
            <Select
              label="City"
              placeholder="Choose a city"
              value={city}
              onChange={(event) => setCity(event.target.value)}
              options={[
                { value: "cairo", label: "Cairo" },
                { value: "lisbon", label: "Lisbon" },
                { value: "accra", label: "Accra" },
              ]}
            />
            <DateField label="Date of birth" value={birthday} onChange={(event) => setBirthday(event.target.value)} />
          </div>
          <RadioPills
            label="Gender"
            name="kit-gender"
            value={gender}
            onChange={setGender}
            options={[
              { value: "female", label: "Female" },
              { value: "male", label: "Male" },
            ]}
          />
          <Field label="Disabled" value="Can’t touch this" disabled readOnly />
        </div>
      </KitBlock>

      <KitBlock title="Selection" note="Arrow keys move through the segmented control; the ink sticker slides.">
        <div className="grid max-w-md gap-6">
          <Toggle checked={notify} onChange={setNotify} label="Night paper follows the system" description="Switch off to choose it yourself." />
          <Toggle checked={false} onChange={() => undefined} label="Disabled toggle" disabled />
        </div>
        <Segmented<Room>
          label="Rooms"
          value={room}
          onChange={setRoom}
          options={[
            { value: "everyone", label: "Everyone" },
            { value: "following", label: "Following" },
            { value: "yours", label: "Yours" },
            { value: "saved", label: "Saved" },
          ]}
        />
        <div className="grid gap-4">
          <Tabs<ProfileTab>
            idBase="kit-tabs"
            label="Profile sections"
            size="sm"
            value={tab}
            onChange={setTab}
            options={[
              { value: "posts", label: "Posts", count: 12 },
              { value: "saved", label: "Saved", count: 4 },
            ]}
          />
          <div role="tabpanel" id={tabPanelId("kit-tabs", tab)} aria-labelledby={tabId("kit-tabs", tab)} className="type-body text-ink-2">
            {tab === "posts" ? "Twelve posts would hang here." : "Four saved posts would hang here."}
          </div>
        </div>
      </KitBlock>
    </div>
  );
}
