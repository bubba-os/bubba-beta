"use server";

import type {
  TransformedCategory,
  TransformedControl,
} from "@/types/framework";
import type {
  ComplianceStatus,
  Control,
  FrameworkCategory,
  OrganizationControl,
} from "@bubba/db";
import { db } from "@bubba/db";
import { z } from "zod";
import { authActionClient } from "../safe-action";

const getCategoriesSchema = z.object({
  frameworkId: z.string(),
});

export const getFrameworkCategoriesAction = authActionClient
  .schema(getCategoriesSchema)
  .action(async ({ parsedInput, ctx }) => {
    const { frameworkId } = parsedInput;
    const { user } = ctx;

    if (!user.organizationId) {
      return {
        success: false,
        error: "No organization found",
      };
    }

    try {
      const categories = await db.frameworkCategory.findMany({
        where: {
          frameworkId,
        },
        include: {
          controls: {
            include: {
              organizationControls: {
                where: {
                  organizationId: user.organizationId,
                },
                include: {
                  artifacts: true,
                },
              },
            },
          },
        },
      });

      const transformedCategories: TransformedCategory[] = categories.map(
        (category) => ({
          ...category,
          controls: category.controls.map((control) => ({
            id: control.id,
            name: control.name,
            code: control.code,
            description: control.description,
            categoryId: control.categoryId,
            requiredArtifactTypes: control.requiredArtifactTypes,
            status: control.organizationControls[0]?.status || "not_started",
            artifacts: control.organizationControls[0]?.artifacts || [],
          })),
        }),
      );

      return {
        success: true,
        data: transformedCategories,
      };
    } catch (error) {
      console.error("Error fetching framework categories:", error);
      return {
        success: false,
        error: "Failed to fetch framework categories",
      };
    }
  });
