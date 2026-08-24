import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import StatusPill from '../../components/common/StatusPill.vue';

describe('StatusPill Component', () => {
  it('renders active status with emerald styles', () => {
    const wrapper = mount(StatusPill, {
      props: {
        status: 'active',
        label: 'ACTIVE',
      },
    });

    expect(wrapper.text()).toContain('ACTIVE');
    expect(wrapper.classes()).toContain('text-emerald-800');
  });

  it('renders critical blocker status with rose styles', () => {
    const wrapper = mount(StatusPill, {
      props: {
        status: 'critical_blocker',
      },
    });

    expect(wrapper.classes()).toContain('text-rose-800');
  });

  it('renders scheduled status with amber styles', () => {
    const wrapper = mount(StatusPill, {
      props: {
        status: 'scheduled',
      },
    });

    expect(wrapper.classes()).toContain('text-amber-800');
  });
});
