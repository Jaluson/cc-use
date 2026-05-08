import pc from 'picocolors';
import prompts from 'prompts';
import { readCcSwitchProviders } from '../core/cc-switch-reader.js';
import {
  mapProviderToProfile,
  buildProfile,
} from '../core/cc-switch-mappers.js';
import {
  saveProfile,
  listProfiles,
  profileExists,
} from '../core/profile.js';

export interface ImportOptions {
  dryRun?: boolean;
}

export async function importFromCcSwitchCommand(
  options: ImportOptions = {},
): Promise<void> {
  const providers = await readCcSwitchProviders();

  if (providers.length === 0) {
    console.log(pc.yellow('未找到用于 Claude Code 的 provider'));
    return;
  }

  // Map providers to profiles
  const mapped = providers.map((p) => ({
    provider: p,
    profile: buildProfile(mapProviderToProfile(p)),
  }));

  // Show preview
  console.log(pc.blue(`找到 ${providers.length} 个 Claude Code provider：`));
  for (const item of mapped) {
    console.log(`  - ${item.profile.label} (${item.profile.preset})`);
  }

  if (options.dryRun) {
    console.log(pc.blue('\n[Preview] 将要导入以下 profile：'));
    console.log(JSON.stringify(mapped.map((m) => m.profile), null, 2));
    return;
  }

  // Always ask import mode
  const modeResponse = await prompts({
    type: 'select',
    name: 'mode',
    message: '请选择导入模式：',
    choices: [
      { title: '全部导入', value: 'all' },
      { title: '逐个确认', value: 'confirm' },
    ],
  });
  if (!modeResponse.mode) {
    console.log(pc.yellow('已取消'));
    return;
  }
  const mode = modeResponse.mode as 'all' | 'confirm';

  let imported = 0;
  let skipped = 0;

  for (const item of mapped) {
    const { profile } = item;
    const exists = await profileExists(profile.label);

    if (mode === 'confirm') {
      // Ask for each provider
      const confirmResponse = await prompts({
        type: 'select',
        name: 'action',
        message: `导入 "${profile.label}" (${profile.preset})？`,
        choices: [
          { title: '导入', value: 'import' },
          { title: '跳过', value: 'skip' },
        ],
      });
      if (!confirmResponse.action || confirmResponse.action === 'skip') {
        skipped++;
        continue;
      }
    }

    if (exists) {
      // Always ask when conflicting, regardless of mode
      const actionResponse = await prompts({
        type: 'select',
        name: 'action',
        message: `Profile "${profile.label}" 已存在，请选择操作：`,
        choices: [
          { title: '覆盖', value: 'overwrite' },
          { title: '跳过', value: 'skip' },
          { title: '重命名', value: 'rename' },
        ],
      });

      if (!actionResponse.action || actionResponse.action === 'skip') {
        skipped++;
        continue;
      }

      if (actionResponse.action === 'rename') {
        const nameResponse = await prompts({
          type: 'text',
          name: 'newName',
          message: '请输入新名称：',
          validate: (value: string) =>
            value.trim().length > 0 ? true : '名称不能为空',
        });
        if (!nameResponse.newName) {
          skipped++;
          continue;
        }
        profile.label = nameResponse.newName.trim();
      }
    }

    await saveProfile(profile);
    console.log(pc.green(`  ✓ 已导入 "${profile.label}"`));
    imported++;
  }

  console.log(
    pc.blue(`\n导入完成：成功 ${imported} 个，跳过 ${skipped} 个`),
  );
}
