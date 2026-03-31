# Shadcn UI コンポーネント リファレンス

## インストール・セットアップ

```bash
# 初期化
npx shadcn@latest init

# コンポーネントの追加（例）
npx shadcn@latest add button
npx shadcn@latest add input card dialog form
```

コンポーネントは `src/components/ui/` に生成される。生成されたファイルは直接編集してカスタマイズできる。

---

## Button

```tsx
import { Button } from "@/components/ui/button";

// バリアント
<Button>デフォルト</Button>
<Button variant="secondary">セカンダリ</Button>
<Button variant="destructive">削除</Button>
<Button variant="outline">アウトライン</Button>
<Button variant="ghost">ゴースト</Button>
<Button variant="link">リンク</Button>

// サイズ
<Button size="sm">小</Button>
<Button size="default">中</Button>
<Button size="lg">大</Button>
<Button size="icon"><PlusIcon /></Button>

// ローディング状態（disabled + Loader2 アイコン）
<Button disabled>
  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
  生成中...
</Button>

// asChild（子要素を Button としてレンダリング）
import { Slot } from "@radix-ui/react-slot";
<Button asChild>
  <Link href="/dashboard">ダッシュボードへ</Link>
</Button>
```

---

## Input / Textarea / Label

```tsx
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

<div className="grid gap-2">
  <Label htmlFor="prompt">プロンプト</Label>
  <Input
    id="prompt"
    type="text"
    placeholder="サムネイルの内容を入力..."
    value={value}
    onChange={(e) => setValue(e.target.value)}
  />
</div>

<div className="grid gap-2">
  <Label htmlFor="description">詳細説明</Label>
  <Textarea
    id="description"
    placeholder="詳細を入力..."
    rows={4}
    className="resize-none"
  />
</div>
```

---

## Card

```tsx
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

<Card>
  <CardHeader>
    <CardTitle>サムネイル生成</CardTitle>
    <CardDescription>
      プロンプトを入力してサムネイルを生成します
    </CardDescription>
  </CardHeader>
  <CardContent>
    <p>コンテンツ</p>
  </CardContent>
  <CardFooter className="flex justify-between">
    <Button variant="outline">キャンセル</Button>
    <Button>生成する</Button>
  </CardFooter>
</Card>;
```

---

## Badge

```tsx
import { Badge } from "@/components/ui/badge";

<Badge>デフォルト</Badge>
<Badge variant="secondary">セカンダリ</Badge>
<Badge variant="destructive">エラー</Badge>
<Badge variant="outline">アウトライン</Badge>

// ジョブステータスの表示例
const statusVariant = {
  pending:    "secondary",
  processing: "secondary",
  completed:  "default",
  failed:     "destructive",
} as const;

<Badge variant={statusVariant[job.status]}>{job.status}</Badge>
```

---

## Dialog

```tsx
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

<Dialog>
  <DialogTrigger asChild>
    <Button>ダウンロード</Button>
  </DialogTrigger>
  <DialogContent className="sm:max-w-[425px]">
    <DialogHeader>
      <DialogTitle>サムネイルのダウンロード</DialogTitle>
      <DialogDescription>
        サムネイルをダウンロードするか YouTube に適用します。
      </DialogDescription>
    </DialogHeader>
    <div className="py-4">{/* コンテンツ */}</div>
    <DialogFooter>
      <Button type="submit">ダウンロード</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>;

// 制御された開閉
const [open, setOpen] = useState(false);
<Dialog open={open} onOpenChange={setOpen}>
  ...
</Dialog>;
```

---

## Alert Dialog（確認ダイアログ）

```tsx
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

<AlertDialog>
  <AlertDialogTrigger asChild>
    <Button variant="destructive">削除</Button>
  </AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>本当に削除しますか？</AlertDialogTitle>
      <AlertDialogDescription>
        この操作は取り消せません。
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>キャンセル</AlertDialogCancel>
      <AlertDialogAction onClick={handleDelete}>削除する</AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>;
```

---

## Form（React Hook Form + Zod 統合）

```tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const schema = z.object({
  prompt: z.string().min(1, "プロンプトを入力してください").max(500),
});

type FormValues = z.infer<typeof schema>;

export function GenerationForm() {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { prompt: "" },
  });

  function onSubmit(values: FormValues) {
    // 送信処理
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="prompt"
          render={({ field }) => (
            <FormItem>
              <FormLabel>プロンプト</FormLabel>
              <FormControl>
                <Input placeholder="サムネイルの内容を入力..." {...field} />
              </FormControl>
              <FormDescription>
                生成したいサムネイルの内容を詳しく入力してください。
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={form.formState.isSubmitting}>
          生成する
        </Button>
      </form>
    </Form>
  );
}
```

---

## Select

```tsx
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

<Select value={value} onValueChange={setValue}>
  <SelectTrigger className="w-[200px]">
    <SelectValue placeholder="スタイルモデルを選択" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="none">なし</SelectItem>
    {models.map((model) => (
      <SelectItem key={model.id} value={model.id}>
        {model.name}
      </SelectItem>
    ))}
  </SelectContent>
</Select>

// React Hook Form との統合
<FormField
  control={form.control}
  name="styleModelId"
  render={({ field }) => (
    <FormItem>
      <FormLabel>スタイルモデル</FormLabel>
      <Select onValueChange={field.onChange} defaultValue={field.value}>
        <FormControl>
          <SelectTrigger>
            <SelectValue placeholder="選択してください" />
          </SelectTrigger>
        </FormControl>
        <SelectContent>
          {models.map((m) => (
            <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <FormMessage />
    </FormItem>
  )}
/>
```

---

## Checkbox / Switch

```tsx
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";

// Checkbox
<div className="flex items-center space-x-2">
  <Checkbox
    id="apply-immediately"
    checked={checked}
    onCheckedChange={setChecked}
  />
  <Label htmlFor="apply-immediately">生成後すぐに YouTube に適用する</Label>
</div>

// Switch
<div className="flex items-center space-x-2">
  <Switch id="auto-apply" checked={enabled} onCheckedChange={setEnabled} />
  <Label htmlFor="auto-apply">自動適用</Label>
</div>
```

---

## Tabs

```tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

<Tabs defaultValue="generate">
  <TabsList>
    <TabsTrigger value="generate">生成</TabsTrigger>
    <TabsTrigger value="history">履歴</TabsTrigger>
    <TabsTrigger value="style">スタイル</TabsTrigger>
  </TabsList>
  <TabsContent value="generate">
    <GenerationForm />
  </TabsContent>
  <TabsContent value="history">
    <HistoryList />
  </TabsContent>
  <TabsContent value="style">
    <StyleModelList />
  </TabsContent>
</Tabs>;
```

---

## Accordion

```tsx
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

<Accordion type="single" collapsible>
  <AccordionItem value="advanced">
    <AccordionTrigger>詳細設定</AccordionTrigger>
    <AccordionContent>
      <div className="space-y-4">{/* 詳細設定フォーム */}</div>
    </AccordionContent>
  </AccordionItem>
</Accordion>;
```

---

## Toast（Sonner）

```tsx
// Sonner を使う場合（shadcn 推奨）
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";

// layout.tsx に追加
<Toaster />;

// 使い方
toast.success("サムネイルを生成しました！");
toast.error("生成に失敗しました。再試行してください。");
toast.loading("生成中...", { id: "generate" });
toast.dismiss("generate");

// Promise トースト（非同期処理に便利）
toast.promise(createGenerationJob(prompt), {
  loading: "生成ジョブを作成中...",
  success: "ジョブを作成しました",
  error: "作成に失敗しました",
});
```

---

## Alert

```tsx
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2 } from "lucide-react";

// エラー
<Alert variant="destructive">
  <AlertCircle className="h-4 w-4" />
  <AlertTitle>エラー</AlertTitle>
  <AlertDescription>{errorMessage}</AlertDescription>
</Alert>

// 成功（カスタム）
<Alert className="border-green-500 text-green-700">
  <CheckCircle2 className="h-4 w-4" />
  <AlertTitle>完了</AlertTitle>
  <AlertDescription>サムネイルの生成が完了しました。</AlertDescription>
</Alert>
```

---

## Skeleton（ローディング状態）

```tsx
import { Skeleton } from "@/components/ui/skeleton";

// カード型のスケルトン
function ThumbnailSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-[180px] w-full rounded-lg" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </div>
  );
}

// 一覧のスケルトン
<div className="grid grid-cols-3 gap-4">
  {Array.from({ length: 6 }).map((_, i) => (
    <ThumbnailSkeleton key={i} />
  ))}
</div>;
```

---

## Progress

```tsx
import { Progress } from "@/components/ui/progress";

// 生成進捗の表示
<Progress value={progress} className="w-full" />;

// ジョブステータスに応じた進捗
const progressValue = {
  pending: 25,
  processing: 60,
  completed: 100,
  failed: 100,
};
<Progress value={progressValue[job.status]} />;
```

---

## Avatar

```tsx
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

<Avatar>
  <AvatarImage src={user.avatarUrl} alt={user.channelName} />
  <AvatarFallback>{user.channelName.slice(0, 2).toUpperCase()}</AvatarFallback>
</Avatar>;
```

---

## Tooltip

```tsx
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// layout.tsx で TooltipProvider を一度だけラップする
<TooltipProvider>
  {children}
</TooltipProvider>

// 使い方
<Tooltip>
  <TooltipTrigger asChild>
    <Button size="icon" variant="ghost">
      <InfoIcon className="h-4 w-4" />
    </Button>
  </TooltipTrigger>
  <TooltipContent>
    <p>月次生成回数: {used} / {limit}</p>
  </TooltipContent>
</Tooltip>
```

---

## Popover

```tsx
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

<Popover>
  <PopoverTrigger asChild>
    <Button variant="outline">フィルター</Button>
  </PopoverTrigger>
  <PopoverContent className="w-80">
    <div className="space-y-4">
      <h4 className="font-medium">フィルター設定</h4>
      {/* フィルター UI */}
    </div>
  </PopoverContent>
</Popover>;
```

---

## Dropdown Menu

```tsx
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="ghost" size="icon">
      <MoreVerticalIcon className="h-4 w-4" />
    </Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent align="end">
    <DropdownMenuLabel>操作</DropdownMenuLabel>
    <DropdownMenuSeparator />
    <DropdownMenuItem onClick={() => handleDownload(job.jobId)}>
      ダウンロード
    </DropdownMenuItem>
    <DropdownMenuItem onClick={() => handleApply(job.jobId)}>
      YouTube に適用
    </DropdownMenuItem>
    <DropdownMenuSeparator />
    <DropdownMenuItem
      className="text-destructive"
      onClick={() => handleDelete(job.jobId)}
    >
      削除
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>;
```

---

## Sheet（サイドパネル）

```tsx
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

<Sheet>
  <SheetTrigger asChild>
    <Button variant="outline">設定</Button>
  </SheetTrigger>
  <SheetContent side="right">
    <SheetHeader>
      <SheetTitle>プロフィール設定</SheetTitle>
      <SheetDescription>アカウントの設定を変更します。</SheetDescription>
    </SheetHeader>
    <div className="py-6">{/* 設定フォーム */}</div>
  </SheetContent>
</Sheet>;
```

---

## Table

```tsx
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

<Table>
  <TableCaption>生成履歴</TableCaption>
  <TableHeader>
    <TableRow>
      <TableHead>プロンプト</TableHead>
      <TableHead>ステータス</TableHead>
      <TableHead>生成日時</TableHead>
      <TableHead className="text-right">操作</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {jobs.map((job) => (
      <TableRow key={job.jobId}>
        <TableCell className="font-medium">{job.prompt}</TableCell>
        <TableCell>
          <Badge variant={statusVariant[job.status]}>{job.status}</Badge>
        </TableCell>
        <TableCell>{format(job.createdAt, "yyyy/MM/dd HH:mm")}</TableCell>
        <TableCell className="text-right">
          <Button size="sm" variant="outline">
            詳細
          </Button>
        </TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>;
```

---

## Separator

```tsx
import { Separator } from "@/components/ui/separator";

<div>
  <p>上のコンテンツ</p>
  <Separator className="my-4" />
  <p>下のコンテンツ</p>
</div>

// 縦向き
<div className="flex h-5 items-center space-x-4">
  <span>項目1</span>
  <Separator orientation="vertical" />
  <span>項目2</span>
</div>
```

---

## Scroll Area

```tsx
import { ScrollArea } from "@/components/ui/scroll-area";

<ScrollArea className="h-[300px] rounded-md border p-4">
  {jobs.map((job) => (
    <div key={job.jobId} className="py-2">
      {job.prompt}
    </div>
  ))}
</ScrollArea>;
```

---

## Command（検索・コマンドパレット）

```tsx
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

// Popover 内で動画選択 UI として使う例
<Command>
  <CommandInput placeholder="動画を検索..." />
  <CommandList>
    <CommandEmpty>動画が見つかりません。</CommandEmpty>
    <CommandGroup heading="動画一覧">
      {videos.map((video) => (
        <CommandItem
          key={video.video_id}
          value={video.video_id}
          onSelect={handleSelect}
        >
          {video.title}
        </CommandItem>
      ))}
    </CommandGroup>
  </CommandList>
</Command>;
```

---

## Calendar / Date Picker

```tsx
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ja } from "date-fns/locale";

function DatePicker() {
  const [date, setDate] = useState<Date>();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-[240px] justify-start text-left">
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP", { locale: ja }) : "日付を選択"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          locale={ja}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}
```

---

## カスタマイズ方針

- スタイルは CSS Modules で管理する。`clsx` で条件付きクラスをマージする
- 生成されたコンポーネントファイルは直接編集してプロジェクト固有のデフォルト値を設定できる

```tsx
// components/ui/Button.tsx
import clsx from "clsx";
import styles from "./Button.module.css";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "secondary" | "destructive" | "ghost";
}

export default function Button({
  variant = "default",
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      className={clsx(styles.button, styles[variant], className)}
      {...props}
    />
  );
}
```
